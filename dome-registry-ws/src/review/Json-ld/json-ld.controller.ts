import { Controller, Get, Param } from '@nestjs/common';
import { JsonLdService } from './json-ld.service';
import { Review } from '../review.schema';

@Controller('markup')
export class DataCatalogController {
  constructor(private readonly jsonLdService: JsonLdService) {}

  @Get('/dataCatalog')
 async getDataCatalogMarkup() {
    return await this.jsonLdService.generateArticleJsonLdHomePage();
  }


  @Get('/dataset')
  async getDatasetMarkup (){
  return await this.jsonLdService.GenerateArticleJsonLdBrowsePage();
   }

   @Get('/:shortid')
   async getStudyMarkup (@Param('shortid')shortid:string){
    return await this.jsonLdService.GenerateArticleJsonLdReviewPage(shortid);
   }
}