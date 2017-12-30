import { Component, OnInit } from '@angular/core';
import { MiscService } from 'app/services/misc.service';

@Component({
  selector: 'app-download-uploader',
  templateUrl: './download-uploader.component.html',
  styleUrls: ['./download-uploader.component.scss']
})
export class DownloadUploaderComponent implements OnInit {

    constructor(
        protected miscService: MiscService
    ) { }

    ngOnInit() {}

    public async download() {
        await this.miscService.getUploader();
    }

}
