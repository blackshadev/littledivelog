import { divetime } from '../../../shared/formatters';
import { debounce } from '../../../shared/common';
import { Dive, ISample, ISampleEvent, SampleEventType, SampleEventFlag } from '../../../shared/dive';
import { DiveService } from '../../../services/dive.service';
import { Component, OnInit, Input, ElementRef, ViewChild, AfterViewInit, HostListener, EventEmitter, Output } from '@angular/core';
import * as d3 from 'd3';


@Component({
  selector: 'app-dive-profile',
  templateUrl: './dive-profile.component.html',
  styleUrls: ['./dive-profile.component.scss']
})
export class DiveProfileComponent implements OnInit, AfterViewInit {
  get dive() { return this._dive; }
  get selectedItem(): ISample {
    if (!this.data || this.selectedIndex === undefined) {
      return {
        Depth: undefined,
        Temperature: undefined,
        Time: undefined,
        Events: []
      };
    }
    return this.data[this.selectedIndex];
  }

  public data: ISample[] = [];
  public allEvents: { dataIndex: number, eventIndex: number }[]  = [];

  @Output() onselect = new EventEmitter<{ item: ISample|undefined, index: number }>();
  @Output() onhover = new EventEmitter<{ item: ISample, index: number }>();

  @Input() set dive(v: Dive) {
    this._dive = v;
    this.update();
  }

  protected samples: ISample[];
  protected _dive: Dive;
  protected svg: d3.Selection<any, any, null, undefined>;
  protected groups: {
    graph: d3.Selection<any, any, null, undefined>,
    line: d3.Selection<any, any, null, undefined>,
    events: d3.Selection<any, any, null, undefined>,
    leftAxis: d3.Selection<any, any, null, undefined>,
    topAxis: d3.Selection<any, any, null, undefined>,
    hover: d3.Selection<any, any, null, undefined>,
    select: d3.Selection<any, any, null, undefined>,
  };
  protected _margin = {
    left: 60,
    right: 20,
    top: 20,
    bottom: 20,
  };
  protected _boundingbox = {
    width: 0,
    height: 0,
  };
  protected _scale: {
    x: d3.ScaleLinear<number, number>,
    y: d3.ScaleLinear<number, number>,
  };
  protected _line: d3.Line<ISample>;

  protected _axes: {
    left: d3.Axis<number|{valueOf(): number}>,
    top: d3.Axis<number|{valueOf(): number}>,
  };
  protected bisect = d3.bisector<ISample, number>((d: ISample) => d.Time).left;
  protected selectedIndex: number;
  @ViewChild('container') protected container: ElementRef;
  protected isReady = false;

  constructor(
    protected service: DiveService,
    protected parentEl: ElementRef,
  ) {
    this._scale = {
      x: d3.scaleLinear(),
      y: d3.scaleLinear(),
    };
    this._line = d3.line<ISample>()
      .curve(d3.curveCardinal)
      .x((d) => this._scale.x(d.Time))
      .y((d) => this._scale.y(d.Depth));

  }

  ngAfterViewInit(): void {
    this.initCanvas();
    this.paint()
    this.resize();
  }

  ngOnInit() {}

  public formatEvent(e: ISampleEvent) {

    if (e.Type === SampleEventType.Heading) {
      return 'Heading set to ' + e.Value;
    }
    if (e.Flags !== SampleEventFlag.None) {
      return SampleEventFlag[e.Flags] + ' of ' + e.Name;
    }
    return e.Name;
  }

  public select(index: number|undefined) {
    if (this.selectedIndex === index) {
      return;
    }

    this.selectedIndex = index;
    this.groups.select.style(
      'display',
      this.selectedIndex === undefined ? 'none' : 'inline'
    );

    this.onselect.emit({ item: this.data[index], index });

    if (this.selectedIndex !== undefined && this.data[index] !== undefined) {
      const d = this.data[index];
      const pos = {
        x: this._scale.x(d.Time),
        y: this._scale.y(d.Depth),
      };
      this.groups.select.select('circle')
        .attr('cx', pos.x)
        .attr('cy', pos.y);
    }
  }

  public async update() {
    const dat = await this.getSamples();
    this.setData(dat);
    this.paint();
  }

  public setData(data: ISample[]) {
    this.select(undefined);
    this.data = data;
    this.fixData();

    const [minTime, maxTime] = [d3.min(this.data, (d) => d.Time), d3.max(this.data, (d) => d.Time)];

    this._scale.x.domain([minTime, maxTime]);
    this._scale.y.domain([
      d3.min(data, (d) => d.Depth),
      d3.max(data, (d) => d.Depth)
    ]);

    this.allEvents = [];
    for (let iX = 0; iX < this.data.length; iX++) {
      if (this.data[iX].Events.length) {
        for (let iY = 0; iY < this.data[iX].Events.length; iY++) {
          this.allEvents.push({ dataIndex: iX, eventIndex: iY });
        }
      }
    }

  }

  public paint() {
    if (!this.isReady) {
      return;
    }
    this.repaintAxes();
    this.repaintLine();
    this.repaintEvents();
  }

  @HostListener('window:resize', ['$event'])
  public resize() {
    const el = (this.parentEl.nativeElement as Element).parentElement;
    const width = el.clientWidth;
    const height = width / 2;
    this.svg.attr('width', width);
    this.svg.attr('height', height);
    this._boundingbox.width = width - this._margin.left - this._margin.right;
    this._boundingbox.height = height - this._margin.top - this._margin.bottom;

    this.groups.hover.select('line.x').attr('y2', height);
    this.groups.hover.select('line.y').attr('x2', width);

    this._scale.x.range([0, this._boundingbox.width]);
    this._scale.y.range([0, this._boundingbox.height]);
    this.paint();
  }

  public selectEvent(idx: number) {
    const evtIdx = this.allEvents[idx];
    console.log('selected', evtIdx);
    const evt = this.data[evtIdx.dataIndex].Events[evtIdx.eventIndex];
    console.log(evt);

    this.select(evtIdx.dataIndex);
  }

  protected initCanvas() {
    this.svg = d3.select(this.container.nativeElement)
      .append('svg');

    const graph = this.svg.append('g')
      .attr('class', 'graph')
      .attr('transform', `translate(${this._margin.left},${this._margin.top})`);
    this.groups = {
      graph,
      line: graph.append('g').attr('class', 'line'),
      events: graph.append('g').attr('class', 'events'),
      hover: graph.append('g').attr('class', 'hover'),
      select: graph.append('g').attr('class', 'select'),
      leftAxis: this.svg.append('g').attr('class', 'left-axis').attr('transform', 'translate(50, 20)'),
      topAxis: this.svg.append('g').attr('class', 'top-axis').attr('transform', `translate(${this._margin.left}, 20)`),
    };
    this._axes = {
      left: d3.axisLeft(this._scale.y),
      top: d3.axisTop(this._scale.x).tickFormat(divetime).ticks(5),
    };

    this.groups.line.append('path').attr('class', 'line');

    this.createHover();
    this.createSelection();
    this.isReady = true;
  }

  protected fixData() {
    if (!this.data.length) {
      return;
    }

    const timeSteps = Array(this.data.length - 1);
    for (let iX = 0; iX < this.data.length - 1; iX++) {
      timeSteps[iX] = this.data[iX + 1].Time - this.data[iX].Time;
    }
    const avgTimeStep = timeSteps.reduce((a, b) => { return a + b}, 0) / timeSteps.length;

    let firstTemp: number|null = null;
    for (let iX = 0; iX < this.data.length; iX++) {
      if (this.data[iX].Temperature !== null) {
        firstTemp = this.data[iX].Temperature;
        break;
      }
    }

    let lastTemp: number|null = null;
    if (firstTemp != null) {
      for (let iX = this.data.length - 1; iX > -1; iX--) {
        if (this.data[iX].Temperature !== null) {
          lastTemp = this.data[iX].Temperature;
          break;
        }
      }
    }

    // Ensure start sample
    if (this.data[0].Depth !== 0) {
      this.data.unshift({ Time: this.data[0].Time - avgTimeStep, Depth: 0, Events: [], Temperature: firstTemp });
    }

    // Ensure end sample
    if (this.data[this.data.length - 1].Depth !== 0) {
      this.data.push({ Depth: 0, Time: this.data[this.data.length - 1].Time + avgTimeStep, Events: [], Temperature: lastTemp });
    }

    const fixData = (prop: 'Temperature'|'Depth') => {
      let iNextSample = 0;
      let iPrevSample = 0;

      while (iPrevSample + 1 < this.data.length) {
        // find gap start
        if (this.data[iPrevSample + 1][prop] !== null) {
          iPrevSample++;
          continue;
        }

        // find gap end
        iNextSample = iPrevSample + 1;
        while (this.data[iNextSample][prop] === null) {
          iNextSample++;
        }

        // interpolate
        const start = this.data[iPrevSample];
        const end  = this.data[iNextSample];
        const slope = (end[prop] - start[prop]) / (end.Time - start.Time);

        for (let iX = iPrevSample + 1; iX < iNextSample; iX++) {
          this.data[iX][prop] = start[prop] + slope * (this.data[iX].Time - start.Time);
        }
      }
    }

    fixData('Depth');
    fixData('Temperature');

  }

  protected async getSamples() {
    return await this.service.getSamples(this._dive.id);
  }

  protected repaintAxes() {
    this.groups.leftAxis.call(
      this._axes.left
    );
    this.groups.topAxis.call(
      this._axes.top,
    );
  }

  protected repaintLine() {
    const line = this.groups.line.selectAll('path');

    line.data([this.data]);

    line.enter().append('path');

    line.merge(line)
      .attr('d', this._line(this.data))

    line.exit().remove();
  }

  protected repaintEvents() {
    const eventData = this.data.filter((d, iX) => d.Events.length > 0);

    const events = this.groups.events.selectAll('circle').data(eventData);

    events.exit().remove();
    events.enter()
      .append('circle')
      .attr('r', '5')
      .merge(events)
        .attr('cx', (s: ISample) => this._scale.x(s.Time))
        .attr('cy', (s: ISample) => this._scale.y(s.Depth))
    ;


  }

  protected createHover() {
    this.groups.hover.append('line')
      .attr('class', 'x')
      .attr('y1', 0).attr('y2', 0);
    this.groups.hover.append('line')
      .attr('class', 'y')
      .attr('x1', 0).attr('x2', 0);

    this.svg
      .on('mouseover', () => { this.groups.hover.style('display', 'inline'); })
      .on('mouseout', () => { this.groups.hover.style('display', 'none'); })
      .on('mousemove', () => {
        const mouse = d3.mouse(this.svg.node());
        if (mouse) {
          const index = this.getClosestIndex(mouse[0]);
          this.hover(index);
        }
      });
  }

  protected getClosestIndex(t: number) {
    const mouseTime = this._scale.x.invert(t - this._margin.left);
    const iX = this.bisect(this.data, mouseTime);
    const item0 = this.data[iX];
    const item1 = this.data[iX - 1];
    const t0 = item0 ? item0.Time : Number.NEGATIVE_INFINITY;
    const t1 = item1 ? item1.Time : Number.POSITIVE_INFINITY;
    // work out which date value is closest to the mouse
    const index = mouseTime - t0 > t1 - mouseTime ? iX - 1 : iX;
    if (!this.data[index]) {
      console.error('No index', index, t0, t1);
    }
    return index;
  }

  protected hover(index: number) {
    const d = this.data[index];
    if (d === undefined) {
      return;
    }
    this.onhover.emit({ item: d, index });

    const focusCrosshair = {
      x: this.groups.hover.select('line.x'),
      y: this.groups.hover.select('line.y'),
    }
    const pos = {
      x: this._scale.x(d.Time),
      y: this._scale.y(d.Depth),
    }
    focusCrosshair.x.attr(`x1`, pos.x).attr(`x2`, pos.x);
    focusCrosshair.y.attr(`y1`, pos.y).attr(`y2`, pos.y);
  }

  protected createSelection() {
    this.groups.select.append('circle').attr('r', 5);
    this.svg.on('click', () => {
      const mouse = d3.mouse(this.svg.node());
      if (mouse) {
        const index = this.getClosestIndex(mouse[0]);
        this.select(index);
      }
    });
  }

}
