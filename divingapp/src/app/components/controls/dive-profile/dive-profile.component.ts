import { Dive, TSample } from '../../../shared/dive';
import { DiveStore } from '../../../services/dive.service';
import { Component, OnInit, Input, ElementRef, ViewChild, AfterViewInit, HostListener } from '@angular/core';

@Component({
  selector: 'app-dive-profile',
  templateUrl: './dive-profile.component.html',
  styleUrls: ['./dive-profile.component.css']
})
export class DiveProfileComponent implements OnInit, AfterViewInit {

  get dive() { return this._dive; }
  @Input() set dive(v: Dive) {
    this._dive = v;
    this.getSamples();
  }

  samples: TSample[];
  private _dive: Dive;

  @ViewChild("profileCanvas") canvas: ElementRef;
  private context: CanvasRenderingContext2D;

  constructor(
    private service: DiveStore,
  ) { }

  ngOnInit() {
    this.resize();
  }
  
  ngAfterViewInit(): void {
    let canvas = this.canvas.nativeElement;
    this.context = canvas.getContext("2d");
  }

  private async getSamples() {
    this.samples = await this.service.getSamples(this._dive.id);
    this.paint();
  }

  public paint() {
    const eCanvas = this.canvas.nativeElement as HTMLCanvasElement;
    const ctx = this.context;
    const height = eCanvas.height;
    const width = eCanvas.width;
    const offset = {
      x: { min: 35, max: 10 },
      y: { min: 10, max: 10 },
    };
    
    const maxDepth = Math.max.apply(Math, this.samples.map((s) => s.Depth));
    

    const wRatio = (width - offset.x.min - offset.x.max ) / this.samples.length;
    const hRatio = (height - offset.y.min - offset.y.max ) / maxDepth;
    
    const stepSize =  this.samples.length;
    ctx.clearRect(0, 0, width, height);
    ctx.imageSmoothingEnabled = false;
    ctx.font = "11px Arial";
    
    ctx.fillText("0 m", 5, 15);
    ctx.fillText(`${maxDepth.toFixed(1)} m`, 5, height - offset.y.max);
    
    ctx.strokeStyle = "#2980B9";
    ctx.beginPath();
    ctx.moveTo(offset.x.min, height - offset.y.max);
    ctx.lineTo(width - offset.x.max, height - offset.y.max);
    ctx.stroke();
    ctx.closePath();

    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1;
    ctx.beginPath();
    if(this.samples.length) {
      ctx.lineTo(offset.x.min, this.samples[0].Depth * hRatio + offset.y.min);
    }
    for(let iX = 1; iX < this.samples.length; iX++) {
      ctx.lineTo(offset.x.min + iX * wRatio, this.samples[iX].Depth * hRatio + offset.y.min);
    }
    ctx.stroke();
    ctx.closePath(); 
  }

  private _delayTime = 250;
  private _delayHandle;
  delayedPaint() {
    if(this._delayHandle !== undefined) {
      clearTimeout(this._delayHandle);
    }
    this._delayHandle = setTimeout(() => this.paint(), this._delayTime);
  }

  @HostListener('window:resize', ['$event'])
  public resize() {
    const canvas = this.canvas.nativeElement as HTMLCanvasElement;
    const parent = canvas.parentElement.parentElement;
    canvas.width = parent.clientWidth;
    canvas.height = canvas.width / 2;
    this.delayedPaint();
  }

}
