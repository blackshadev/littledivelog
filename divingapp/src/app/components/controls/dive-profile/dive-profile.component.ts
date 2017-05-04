import { debounce } from '../../../shared/common';
import { Dive, TSample } from '../../../shared/dive';
import { DiveStore } from '../../../services/dive.service';
import { Component, OnInit, Input, ElementRef, ViewChild, AfterViewInit, HostListener, EventEmitter, Output } from '@angular/core';
import * as d3 from 'd3';


@Component({
  selector: 'app-dive-profile',
  templateUrl: './dive-profile.component.html',
  styleUrls: ['./dive-profile.component.scss']
})
export class DiveProfileComponent implements OnInit, AfterViewInit {
  get dive() { return this._dive; }
  get selectedItem(): TSample {
    if (!this._data || this.selectedIndex === undefined) {
      return {
        Depth: undefined,
        Temperature: undefined,
        Time: undefined,
        Events: []
      };
    }
    return this._data[this.selectedIndex];
  }

  @Output() onselect = new EventEmitter<{ item: TSample|undefined, index: number }>();
  @Output() onhover = new EventEmitter<{ item: TSample, index: number }>();

  @Input() set dive(v: Dive) {
    this._dive = v;
    this.update();
  }

  protected samples: TSample[];
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
  protected _line: d3.Line<TSample>;
  protected _data: TSample[] = [];
  protected _eventLocations: number[] = [];
  protected _axes: {
    left: d3.Axis<number|{valueOf(): number}>,
    top: d3.Axis<number|{valueOf(): number}>,
  };
  protected bisect = d3.bisector<TSample, number>((d: TSample) => d.Time).left;
  protected selectedIndex: number;
  @ViewChild('container') protected container: ElementRef;
  protected isReady = false;

  constructor(
    protected service: DiveStore,
    protected parentEl: ElementRef,
  ) {
    this._scale = {
      x: d3.scaleLinear(),
      y: d3.scaleLinear(),
    };
    this._line = d3.line<TSample>()
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

  public select(index: number|undefined) {
    if (this.selectedIndex === index) {
      return;
    }

    this.selectedIndex = index;
    this.groups.select.style(
      'display',
      this.selectedIndex === undefined ? 'none' : 'inline'
    );

    this.onselect.emit({ item: this._data[index], index });
    if (this.selectedIndex !== undefined && this._data[index] !== undefined) {
      const d = this._data[index];
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

  public setData(data: TSample[]) {
    this.select(undefined);
    this._data = data;
    this.getEvents();
    this._scale.x.domain([0, d3.max(data, (d) => d.Time)]);
    this._scale.y.domain([
      d3.min(data, (d) => d.Depth),
      d3.max(data, (d) => d.Depth)
    ]);
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

  protected initCanvas() {
    this.svg = d3.select(this.container.nativeElement)
      .append('svg');

    const graph = this.svg.append('g')
      .attr('class', 'graph')
      .attr('transform', `translate(${this._margin.left},${this._margin.top})`);
    this.groups = {
      graph,
      hover: graph.append('g').attr('class', 'hover'),
      select: graph.append('g').attr('class', 'select'),
      line: graph.append('g').attr('class', 'line'),
      events: graph.append('g').attr('class', 'events'),
      leftAxis: this.svg.append('g').attr('class', 'left-axis').attr('transform', 'translate(50, 20)'),
      topAxis: this.svg.append('g').attr('class', 'top-axis'),
    };
    this._axes = {
      left: d3.axisLeft(this._scale.y),
      top: d3.axisTop(this._scale.x),
    };

    this.groups.line.append('path').attr('class', 'line');

    this.createHover();
    this.createSelection();
    this.isReady = true;
  }

  protected async getSamples() {
    return await this.service.getSamples(this._dive.id);
  }

  protected getEvents() {
    this._eventLocations.length = 0;
    for (let iX = 0; iX < this._data.length; iX++) {
      if (this._data[iX].Events.length) {
        this._eventLocations.push(iX);
      }
    }
  }

  protected repaintAxes() {
    const all = this.groups.leftAxis.selectAll();
    this.groups.leftAxis.call(
      this._axes.left
    );
  }

  protected repaintLine() {
    const line = this.groups.line.selectAll('path');
    line.data([this._data]);

    line.enter().append('path');

    line.transition()
      .ease(d3.easeLinear)
      .duration(1000)
      .attr('d', this._line(this._data));

    line.exit().remove();
  }

  protected repaintEvents() {
    const events = this.groups.events.selectAll('circle');
    events.data([this._eventLocations]);

    events.enter()
      .append('circle')
      .attr('cx', (iX: number) => this._scale.x(this._data[iX].Time))
      .attr('cy', (iX: number) => this._scale.y(this._data[iX].Depth))
      .attr('r', '2')
      ;

    events.transition()
      .ease(d3.easeLinear)
      .duration(1000)
      .attr('cx', (iX: number) => this._scale.x(this._data[iX].Time))
      .attr('cy', (iX: number) => this._scale.y(this._data[iX].Depth));

    events.exit().remove();
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
    const mouseTime = this._scale.x.invert(t);
    const iX = this.bisect(this._data, mouseTime);
    const item0 = this._data[iX];
    const item1 = this._data[iX - 1];
    const t0 = item0 ? item0.Time : Number.NEGATIVE_INFINITY;
    const t1 = item1 ? item1.Time : Number.POSITIVE_INFINITY;
    // work out which date value is closest to the mouse
    const index = mouseTime - t0 > t1 - mouseTime ? iX - 1 : iX;
    if(!this._data[index]) {
      console.error("No index", index, t0, t1);
    }
    return index;
  }

  protected hover(index: number) {
    const d = this._data[index];
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
