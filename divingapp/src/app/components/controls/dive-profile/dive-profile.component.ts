import { debounce } from '../../../shared/common';
import { Dive, TSample } from '../../../shared/dive';
import { DiveStore } from '../../../services/dive.service';
import { Component, OnInit, Input, ElementRef, ViewChild, AfterViewInit, HostListener } from '@angular/core';
import * as d3 from 'd3';


@Component({
  selector: 'app-dive-profile',
  templateUrl: './dive-profile.component.html',
  styleUrls: ['./dive-profile.component.css']
})
export class DiveProfileComponent implements OnInit, AfterViewInit {
  get dive() { return this._dive; }
  @Input() set dive(v: Dive) {
    this._dive = v;
    this.update();
  }

  samples: TSample[];
  private _dive: Dive;
  private svg: d3.Selection<any, any, null, undefined>;
  private groups: {
    line: d3.Selection<any, any, null, undefined>,
    leftAxis: d3.Selection<any, any, null, undefined>,
    topAxis: d3.Selection<any, any, null, undefined>,
    focus: d3.Selection<any, any, null, undefined>,
  };
  private _margin = {
    left: 60,
    right: 20,
    top: 20,
    bottom: 20,
  };
  private _boundingbox = {
    width: 0,
    height: 0,
  };
  private _scale: {
    x: d3.ScaleLinear<number, number>,
    y: d3.ScaleLinear<number, number>,
  };
  private _line: d3.Line<TSample>;
  private _data: TSample[] = [];
  private _axes: {
    left: d3.Axis<number|{valueOf(): number}>,
    top: d3.Axis<number|{valueOf(): number}>,
  };
  private bisect = d3.bisector<TSample, number>((d: TSample) => d.Time).left;

  constructor(
    private service: DiveStore,
    private elRef: ElementRef,
  ) {
    this._scale = {
      x: d3.scaleLinear(),
      y: d3.scaleLinear(),
    };
    this._line = d3.line<TSample>()
      .curve(d3.curveCardinal)
      .x((d) => this._scale.x(d.Time))
      .y((d) => this._scale.y(d.Depth));
    this.svg = d3.select(this.elRef.nativeElement)
      .append('svg');
    this.groups = {
      line: this.svg.append('g').attr('class', 'group-line'),
      leftAxis: this.svg.append('g').attr('class', 'group-left-axis'),
      topAxis: this.svg.append('g').attr('class', 'group-top-axis'),
      focus: this.svg.append('g').attr('class', 'group-focus'),
    };
    this.groups.line.attr('transform', `translate(${this._margin.left},${this._margin.top})`);
    this._axes = {
      left: d3.axisLeft(this._scale.y),
      top: d3.axisTop(this._scale.x),
    };

    this.groups.focus.append('line')
      .attr('class', 'x')
      .attr('y1', this._margin.top).attr('y2', 0);
    this.groups.focus.append('line')
      .attr('class', 'y')
      .attr('x1', this._margin.left).attr('x2', 0);

    this.svg
    .on('mouseover', () => { this.groups.focus.style('display', null); })
      .on('mouseout', () => { this.groups.focus.style('display', 'none'); })
      .on('mousemove', () => {
        const mouse = d3.mouse(this.svg.node());
        if (mouse) {
          this.select(mouse[0]);
        }
      });
  }

  ngAfterViewInit(): void {
    this.groups.line.append('path')
      .attr('class', 'line');
    this.resize();
  }

  ngOnInit() {
    this.paint()
  }

  private select(mouseX: number) {
    const mouseTime = this._scale.x.invert(mouseX - this._margin.left);
    const iX = this.bisect(this._data, mouseTime);
    const item = this._data[iX];
    const d0 = this._data[iX - 1]
    const d1 = this._data[iX];
    // work out which date value is closest to the mouse
    const d = mouseTime - d0[0] > d1[0] - mouseTime ? d1 : d0;
    const focusCrosshair = {
      x: this.groups.focus.select('line.x'),
      y: this.groups.focus.select('line.y'),
    }
    const pos = {
      x: this._scale.x(d.Time) + this._margin.left,
      y: this._scale.y(d.Depth) + this._margin.top,
    }
    focusCrosshair.x.attr(`x1`, pos.x).attr(`x2`, pos.x);
    focusCrosshair.y.attr(`y1`, pos.y).attr(`y2`, pos.y);
  }

  private async getSamples() {
    return await this.service.getSamples(this._dive.id);
  }

  public async update() {
    const dat = await this.getSamples();
    this.setData(dat);
    this.paint();
  }


  public setData(data: TSample[]) {
    this._data = data;
    this._scale.x.domain([0, d3.max(data, (d) => d.Time)]);
    this._scale.y.domain([
      d3.min(data, (d) => d.Depth),
      d3.max(data, (d) => d.Depth)
    ]);
  }

  public paint() {
    this.repaintAxes();
    const all = this.groups.line.selectAll('path');
    all.data([this._data]);

    all.enter().append('path');

    all.transition()
      .ease(d3.easeLinear)
      .duration(1000)
      .attr('d', this._line(this._data));

    all.exit().remove();
  }

  @HostListener('window:resize', ['$event'])
  public resize() {
    const el = (this.elRef.nativeElement as Element).parentElement;
    const width = el.clientWidth;
    const height = width / 2;
    this.svg.attr('width', width);
    this.svg.attr('height', height);
    this._boundingbox.width = width - this._margin.left - this._margin.right;
    this._boundingbox.height = height - this._margin.top - this._margin.bottom;

    this.groups.focus.select('line.x').attr('y2', height);
    this.groups.focus.select('line.y').attr('x2', width);

    this._scale.x.range([0, this._boundingbox.width]);
    this._scale.y.range([0, this._boundingbox.height]);
    this.paint();
  }

  protected repaintAxes() {
    this.groups.leftAxis.attr('transform', 'translate(50, 20)')
    const all = this.groups.leftAxis.selectAll();
    all.remove();
    this.groups.leftAxis.call(
      this._axes.left
    );
  }

}
