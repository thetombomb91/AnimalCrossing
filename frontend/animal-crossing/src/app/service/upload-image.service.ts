import { Injectable } from '@angular/core';
import { of, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { s3SignedUrl } from '../models/s3SignedUrl';
import { environment } from '../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class UploadImageService {
  private getS3SignedUrlEndpoint = environment.apigatewayBaseUrl + '/get-signed-s3-url';

  constructor(
    private http: HttpClient
  ) { }

  private getSignedS3Url(): Observable<any> {
    return this.http.get<s3SignedUrl>(this.getS3SignedUrlEndpoint);
  }


  public uploadImage(image: File) {
    this.getSignedS3Url().subscribe(s3Url => {   
      this.uploadToS3(s3Url.signedUrl, this.renameImageToMatchSignedUrlKey(image, s3Url)).subscribe();
    })
  }

  private renameImageToMatchSignedUrlKey(image: File, s3Url: any) {
    const blob = image.slice(0, image.size, 'image/jpeg');
    const newFile = new File([blob], `${s3Url.key}.jpg`, { type: 'image/jpeg' });
    return newFile;
  }


  private uploadToS3(signedUrl, image) {
    const headers = {
      headers: {
        "Content-Type": image.type
      },
      params: {
        clientFilename: image.name,
        mimeType: image.type
      }
    }
    return this.http.put<any>(signedUrl, image, headers)
  }
}
