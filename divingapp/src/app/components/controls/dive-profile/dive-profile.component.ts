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
      x: 10,
      y: 10
    };

    const wRatio = (width - offset.x * 2) / this.samples.length;
    const hRatio = (height - offset.y * 2) / Math.max.apply(Math, this.samples.map((s) => s.Depth));
    
    const stepSize =  this.samples.length;
    ctx.clearRect(0, 0, width, height);
    ctx.imageSmoothingEnabled = true;
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1;
    ctx.beginPath();
    if(this.samples.length) {
      ctx.lineTo(offset.x, this.samples[0].Depth * hRatio + offset.y);
    }
    for(let iX = 1; iX < this.samples.length; iX++) {
      ctx.lineTo(offset.x + iX * wRatio, this.samples[iX].Depth * hRatio + offset.y);
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
