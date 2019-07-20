import { divetime, temperature } from '../../../shared/formatters';
import { debounce } from '../../../shared/common';
import {
    Dive,
    ISample,
    ISampleEvent,
    SampleEventType,
    SampleEventFlag,
} from '../../../shared/dive';
import { DiveService } from '../../../services/dive.service';
import {
    Component,
    OnInit,
    Input,
    ElementRef,
    ViewChild,
    AfterViewInit,
    HostListener,
    EventEmitter,
    Output,
} from '@angular/core';
import * as d3 from 'd3';
import { RGBColor } from 'd3';

@Component({
    selector: 'app-dive-profile',
    templateUrl: './dive-profile.component.html',
    styleUrls: ['./dive-profile.component.scss'],
})
export class DiveProfileComponent implements OnInit, AfterViewInit {
    get selectedItem(): ISample {
        if (!this.data || this.selectedIndex === undefined) {
            return {
                Depth: null,
                Events: [],
                Temperature: null,
                Time: null,
            };
        }
        return this.data[this.selectedIndex];
    }

    public data: ISample[] = [];
    public allEvents: { dataIndex: number; eventIndex: number }[] = [];
    public get hasData() {
        return this.data && this.data.length > 0;
    }

    @Output()
    onselect = new EventEmitter<{
        item: ISample | undefined;
        index: number | undefined;
    }>();
    @Output() onhover = new EventEmitter<{ item: ISample; index: number }>();

    @Input()
    set dive(v: Dive) {
        this._dive_id = v.id;
        this.update();
    }

    protected samples!: ISample[];
    protected _dive_id: number | undefined;
    protected svg!: d3.Selection<any, any, null, undefined>;
    protected groups!: {
        graph: d3.Selection<any, any, null, undefined>;
        line: d3.Selection<any, any, null, undefined>;
        events: d3.Selection<any, any, null, undefined>;
        leftAxis: d3.Selection<any, any, null, undefined>;
        tempetureGroup: d3.Selection<any, any, null, undefined>;
        tempetureLegend: d3.Selection<any, any, null, undefined>;
        tempeturePointer: d3.Selection<any, any, null, undefined>;
        // tempetureAxis: d3.Selection<any, any, null, undefined>;
        topAxis: d3.Selection<any, any, null, undefined>;
        hover: d3.Selection<any, any, null, undefined>;
        select: d3.Selection<any, any, null, undefined>;
        tempetureOverlay: d3.Selection<any, any, null, undefined>;
        labels: {
            x: d3.Selection<any, any, null, undefined>;
            y: d3.Selection<any, any, null, undefined>;
            temperature: d3.Selection<any, any, null, undefined>;
        };
    };
    protected _margin = {
        left: 60,
        right: 60,
        top: 60,
        bottom: 20,
    };
    protected _boundingbox = {
        width: 0,
        height: 0,
    };
    protected _scale: {
        x: d3.ScaleLinear<number, number>;
        y: d3.ScaleLinear<number, number>;
        temperature: d3.ScaleLinear<d3.RGBColor, string>;
        temperatureRev: d3.ScaleLinear<number, number>;
    };
    protected _line: d3.Line<ISample>;

    protected _axes!: {
        left: d3.Axis<number | { valueOf(): number }>;
        top: d3.Axis<number | { valueOf(): number }>;
        temperature: d3.Axis<number | { valueOf(): number }>;
    };
    protected bisect = d3.bisector<ISample, number>((d: ISample) => d.Time)
        .left;
    protected selectedIndex: number | undefined;
    @ViewChild('container', { static: true }) protected container!: ElementRef;
    protected isReady = false;

    constructor(
        protected service: DiveService,
        protected parentEl: ElementRef,
    ) {
        this._scale = {
            x: d3.scaleLinear(),
            y: d3.scaleLinear(),
            temperature: d3
                .scaleLinear<d3.RGBColor, string>()
                .interpolate(d3.interpolateHcl as any)
                .range([
                    d3.rgb('#0000ff'),
                    d3.rgb('#00ff00'),
                    d3.rgb('#ff0000'),
                ]),
            temperatureRev: d3.scaleLinear(),
        };
        this._line = d3
            .line<ISample>()
            .curve(d3.curveCardinal)
            .x(d => this._scale.x(d.Time))
            .y(d => this._scale.y(d.Depth));
    }

    ngAfterViewInit(): void {
        this.initCanvas();
        this.paint();
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

    public select(index: number | undefined) {
        if (this.selectedIndex === index) {
            return;
        }

        this.selectedIndex = index;
        const dive = this.data[index || -1];
        this.groups.select.style(
            'display',
            this.selectedIndex === undefined ? 'none' : 'inline',
        );

        this.onselect.emit({ item: dive, index });

        if (
            index !== undefined &&
            this.selectedIndex !== undefined &&
            this.data[index] !== undefined
        ) {
            const d = this.data[index];
            const pos = {
                x: this._scale.x(d.Time),
                y: this._scale.y(d.Depth),
            };
            this.groups.select
                .select('circle')
                .attr('cx', pos.x)
                .attr('cy', pos.y);
            this.setTemperaturePointer(this.data[index].Temperature);
        }
    }

    public setTemperaturePointer(v?: number) {
        const line = this.groups.tempeturePointer
            .selectAll('line')
            .data(v ? [v] : []);

        line.enter()
            .append('line')
            .attr('x1', -8)
            .attr('x2', 5)
            .attr('y1', this._scale.temperatureRev)
            .attr('y2', this._scale.temperatureRev);

        line.exit().remove();

        line.transition()
            .duration(500)
            .attr('x1', -8)
            .attr('x2', 5)
            .attr('y1', this._scale.temperatureRev)
            .attr('y2', this._scale.temperatureRev);

        const text = this.groups.tempeturePointer
            .selectAll('text')
            .data(v ? [v] : []);

        text.enter()
            .append('text')
            .attr('text-anchor', 'end')
            .attr('alignment-baseline', 'middle')
            .attr('x', -10)
            .attr('y', this._scale.temperatureRev);

        text.exit().remove();

        text.transition()
            .attr('text-anchor', 'end')
            .attr('alignment-baseline', 'middle')
            .attr('x', -10)
            .text(_v => _v.toFixed(1))
            .duration(500)
            .attr('y', this._scale.temperatureRev);
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

        const [minTime, maxTime] = [
            d3.min(this.data, d => d.Time),
            d3.max(this.data, d => d.Time),
        ] as [number, number];

        const [minTemp, maxTemp, medianTemp] = [
            d3.min(this.data, d => d.Temperature),
            d3.max(this.data, d => d.Temperature),
            d3.median(this.data, d => d.Temperature),
        ] as [number, number, number];
        const [minDepth, maxDepth] = [
            d3.min(data, d => d.Depth),
            d3.max(data, d => d.Depth),
        ] as [number, number];

        this._scale.x.domain([minTime, maxTime]);
        this._scale.y.domain([minDepth, maxDepth]);
        this._scale.temperature
            .domain([minTemp, medianTemp, maxTemp])
            .range([d3.rgb('#0000ff'), d3.rgb('#00ff00'), d3.rgb('#ff0000')]);
        this._scale.temperatureRev.domain([maxTemp, minTemp]);

        this.allEvents = [];
        for (let iX = 0; iX < this.data.length; iX++) {
            const event = this.data[iX].Events;

            if (event && event.length) {
                for (let iY = 0; iY < event.length; iY++) {
                    this.allEvents.push({ dataIndex: iX, eventIndex: iY });
                }
            }
        }
    }

    public paint() {
        if (!this.isReady || !this.data) {
            return;
        }
        this.repaintAxes();
        this.repaintLine();
        this.repaintGradient();
        this.repaintEvents();
    }

    @HostListener('window:resize', ['$event'])
    public resize() {
        const el = (this.parentEl.nativeElement as Element).parentElement;
        if (!el) {
            return;
        }

        const width = el.clientWidth;
        const height = width / 2;
        this.svg.attr('width', Math.max(0, width));
        this.svg.attr('height', height);

        this._boundingbox.width =
            width - this._margin.left - this._margin.right;
        this._boundingbox.height =
            height - this._margin.top - this._margin.bottom;

        if (this._boundingbox.width < 0 || this._boundingbox.height < 0) {
            return;
        }

        this.groups.leftAxis.attr(
            'transform',
            `translate(50, ${this._margin.top})`,
        );

        this.groups.topAxis.attr(
            'transform',
            `translate(${this._margin.left}, 50)`,
        );
        this.groups.tempetureGroup.attr(
            'transform',
            `translate(${width - this._margin.right + 10}, ${
                this._margin.top
            })`,
        );
        this.groups.tempetureLegend
            .select('rect')
            .attr('height', this._boundingbox.height);
        this.groups.hover.select('line.x').attr('y2', height);
        this.groups.hover.select('line.y').attr('x2', width);

        this.groups.labels.x.attr(
            'transform',
            `translate(${this._boundingbox.width / 2 + this._margin.left}, 20)`,
        );

        this.groups.labels.y.attr(
            'transform',
            `translate(20, ${this._boundingbox.height / 2 +
                this._margin.top})rotate(-90)`,
        );

        this.groups.labels.temperature.attr(
            'transform',
            `translate(${width - 20}, ${this._boundingbox.height / 2 +
                this._margin.top})rotate(90)`,
        );

        this._scale.x.range([0, this._boundingbox.width]);
        this._scale.y.range([0, this._boundingbox.height]);
        this._scale.temperatureRev.range([0, this._boundingbox.height]);
        this.paint();
    }

    public selectEvent(idx: number) {
        const evtIdx = this.allEvents[idx];
        const sample = this.data[evtIdx.dataIndex];

        if (sample.Events) {
            const evt = sample.Events[evtIdx.eventIndex];

            this.select(evtIdx.dataIndex);
        }
    }

    protected initCanvas() {
        this.svg = d3.select(this.container.nativeElement).append('svg');

        const graph = this.svg
            .append('g')
            .attr('class', 'graph')
            .attr(
                'transform',
                `translate(${this._margin.left},${this._margin.top})`,
            );
        const labels = this.svg.append('g').attr('class', 'labels');
        const tempGroup = this.svg.append('g').attr('class', 'temperature');

        this.groups = {
            graph,
            line: graph.append('g').attr('class', 'line'),
            events: graph.append('g').attr('class', 'events'),
            hover: graph.append('g').attr('class', 'hover'),
            select: graph.append('g').attr('class', 'select'),
            leftAxis: this.svg.append('g').attr('class', 'left-axis'),
            topAxis: this.svg.append('g').attr('class', 'top-axis'),
            tempetureOverlay: graph
                .append('linearGradient')
                .attr('id', 'line-gradient'),
            tempetureGroup: tempGroup,
            tempetureLegend: tempGroup
                .append('g')
                .attr('class', 'temperature-legend'),
            tempeturePointer: tempGroup
                .append('g')
                .attr('class', 'temperature-pointer'),
            labels: {
                x: labels
                    .append('text')
                    .attr('text-anchor', 'middle')
                    .text('Time'),
                y: labels
                    .append('text')
                    .attr('text-anchor', 'middle')
                    .text('Depth in Meters'),
                temperature: labels
                    .append('text')
                    .attr('text-anchor', 'middle')
                    .text('Temperature in ℃'),
            },
        };
        this._axes = {
            left: d3.axisLeft(this._scale.y),
            top: d3
                .axisTop(this._scale.x)
                .tickFormat(divetime as any)
                .ticks(5),
            temperature: d3
                .axisRight(this._scale.temperatureRev)
                .ticks(3)
                .tickFormat(((v: number) => v.toFixed(1)) as any),
        };

        this.groups.line.append('path').attr('class', 'line');

        this.createTempetureLegend();
        this.createHover();
        this.createSelection();
        this.isReady = true;
    }

    protected createTempetureLegend() {
        const tempLegendGradient = this.svg
            .append('linearGradient')
            .attr('id', 'line-gradient-legend')
            .attr('x2', '0%')
            .attr('y2', '100%');
        tempLegendGradient
            .append('stop')
            .attr('offset', '0%')
            .attr('stop-color', '#ff0000');
        tempLegendGradient
            .append('stop')
            .attr('offset', '50%')
            .attr('stop-color', '#00ff00');
        tempLegendGradient
            .append('stop')
            .attr('offset', '100%')
            .attr('stop-color', '#0000ff');

        this.groups.tempetureLegend
            .append('rect')
            .attr('width', 5)
            .attr('transform', 'translate(-5, 0)')
            .style('fill', 'url(#line-gradient-legend)');

        this.groups.tempeturePointer.append('line');
        this.groups.tempeturePointer.append('text');
    }

    protected fixData() {
        if (!this.data.length) {
            return;
        }

        const timeSteps = Array(this.data.length - 1);
        for (let iX = 0; iX < this.data.length - 1; iX++) {
            timeSteps[iX] = this.data[iX + 1].Time - this.data[iX].Time;
        }
        const avgTimeStep =
            timeSteps.reduce((a, b) => {
                return a + b;
            }, 0) / timeSteps.length;

        let firstTemp: number | null = null;
        for (let iX = 0; iX < this.data.length; iX++) {
            if (this.data[iX].Temperature !== null) {
                firstTemp = this.data[iX].Temperature;
                break;
            }
        }

        let lastTemp: number | null = null;
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
            this.data.unshift({
                Time: this.data[0].Time - avgTimeStep,
                Depth: 0,
                Events: [],
                Temperature: firstTemp,
            });
        }

        // Ensure end sample
        if (this.data[this.data.length - 1].Depth !== 0) {
            this.data.push({
                Depth: 0,
                Time: this.data[this.data.length - 1].Time + avgTimeStep,
                Events: [],
                Temperature: lastTemp,
            });
        }

        const fixData = (prop: 'Temperature' | 'Depth') => {
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
                const end = this.data[iNextSample];
                const slope =
                    (end[prop] - start[prop]) / (end.Time - start.Time);

                for (let iX = iPrevSample + 1; iX < iNextSample; iX++) {
                    this.data[iX][prop] =
                        start[prop] + slope * (this.data[iX].Time - start.Time);
                }
            }
        };

        fixData('Depth');
        fixData('Temperature');
    }

    protected async getSamples() {
        return await this.service.samples(this._dive_id);
    }

    protected repaintAxes() {
        this.groups.leftAxis.call(this._axes.left);
        this.groups.topAxis.call(this._axes.top);
        this.groups.tempetureLegend.call(this._axes.temperature);
    }

    protected repaintLine() {
        const line = this.groups.line.selectAll('path').data([this.data]);

        line.enter()
            .append('path')
            .attr('d', this._line(this.data));

        line.transition()
            .duration(500)
            .attr('d', this._line(this.data));

        line.exit().remove();
    }

    protected repaintGradient() {
        const gradient = this.groups.tempetureOverlay
            .selectAll('stop')
            .data(this.data);

        gradient
            .enter()
            .append('stop')
            .attr('offset', (d, iX) => {
                return (iX / this.data.length) * 100 + '%';
            })
            .attr('stop-color', (d: ISample) => {
                return this._scale.temperature(d.Temperature);
            });
        gradient
            .transition()
            .duration(500)
            .attr('offset', (d, iX) => {
                return (iX / this.data.length) * 100 + '%';
            })
            .attr('stop-color', (d: ISample) => {
                return this._scale.temperature(d.Temperature);
            });
        gradient.exit().remove();
    }

    protected repaintEvents() {
        const eventData = this.data.filter(
            (d, iX) => d.Events && d.Events.length > 0,
        );

        const events = this.groups.events.selectAll('circle').data(eventData);

        events.exit().remove();
        events
            .enter()
            .append('circle')
            .attr('r', '5')
            .merge(events)
            .attr('cx', (s: ISample) => this._scale.x(s.Time))
            .attr('cy', (s: ISample) => this._scale.y(s.Depth));
    }

    protected createHover() {
        this.groups.hover
            .append('line')
            .attr('class', 'x')
            .attr('y1', 0)
            .attr('y2', 0);
        this.groups.hover
            .append('line')
            .attr('class', 'y')
            .attr('x1', 0)
            .attr('x2', 0);

        this.svg
            .on('mouseover', () => {
                this.groups.hover.style('display', 'inline');
            })
            .on('mouseout', () => {
                this.groups.hover.style('display', 'none');
            })
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
        };
        const pos = {
            x: this._scale.x(d.Time),
            y: this._scale.y(d.Depth),
        };
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
