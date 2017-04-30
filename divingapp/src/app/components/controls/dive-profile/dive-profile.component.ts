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
    axis: d3.Selection<any, any, null, undefined>,
  };
  private _margin = {
    left: 20,
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

  constructor(
    private service: DiveStore,
    private elRef: ElementRef,
  ) {
    this._scale = {
      x: d3.scaleLinear(),
      y: d3.scaleLinear(),
    };
    this._line = d3.line<TSample>()
      .curve(d3.curveBasis)
      .x((d) => this._scale.x(d.Time))
      .y((d) => this._scale.y(d.Depth));
    this.svg = d3.select(this.elRef.nativeElement)
      .append('svg');
    this.groups = {
      line: this.svg.append('g').attr('class', 'group-line'),
      axis: this.svg.append('g').attr('class', 'group-axis'),
    };
    this.groups.line.attr('transform', `translate(${this._margin.left},${this._margin.top})`)
  }

  ngAfterViewInit(): void {
    this.groups.line.append('path')
      .attr('class', 'line')
      .style('fill', 'none')
      .style('stroke', 'black');
    this.resize();
  }

  ngOnInit() {
    this.paint()
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
    const all = this.groups.line.selectAll('path');
    all.data([this._data]);

    all.enter().append('path');

    all.transition()
      .ease(d3.easeLinear)
      .duration(1000)
      .attr('d', this._line(this._data))

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
    this._scale.x.range([0, this._boundingbox.width]);
    this._scale.y.range([0, this._boundingbox.height]);
    this.paint();
  }

}
