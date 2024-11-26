import { Injectable } from '@nestjs/common';
import { Review, ReviewDocument } from '../review.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Types, Model, Query, QueryOptions, mongo } from "mongoose";
@Injectable()
export class JsonLdService {
  constructor( @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>){
   
  }
  async  generateArticleJsonLdHomePage(): Promise<string> {
        const jsonLd = {
            '@context': 'https://schema.org',
            '@type': 'DataCatalog',
            '@id': "https://registry.dome-ml.org/#Datacatalog",
            "http://purl.org/dc/terms/conformsTo": {
                "@type": "CreativeWork",
                "@id": "https://bioschemas.org/profiles/DataCatalog/0.3-RELEASE-2019_07_01"
            },
            "sameAs": "https://registry.identifiers.org/registry/mobidb",
            "url": "https://mobidb.org/",
            "identifier": "https://registry.identifiers.org/registry/mobidb",
            "name": "DOME Registry",
            "description": "The central activity in DOME Registry is the curation of Intrinsically of machine learning methods in biology from relevant publications.Data collection, annotation and integration in The DOME Registry is the result of an effort of expert curators.Curators annotate machine learning methods through data stawardship wizard instance which is a dedicated curation interface",

            "citation": {
                "@type": "ScholarlyArticle",
                "@id": "https://doi.org/10.1093/gigascience/giae094",
                "name": "DOME Registry: Implementing community-wide recommendations for reporting supervised machine learning in biology",
                "url": "https://doi.org/10.1093/gigascience/giae094",
                "sameAs": [
                    "https://academic.oup.com/nar/article-lookup/doi/10.1093/nar/gkac1065",
                    "https://pubmed.ncbi.nlm.nih.gov/36416266/"
                ]
            },

            "Keywords": [
                "machine learning",
                "reproducibility",
                "recommendations",
            ],
            "sourceOrganizaiton": [
                {
                    "@Type": 'Organization',
                    "@id": "https://biocomputingup.it/#Organization",

                    "http://purl.org/dc/terms/conformsTo": {
                        "@id": "https://bioschemas.org/profiles/Organization/0.2-DRAFT-2019_07_19",
                        "@type": "CreativeWork"
                    },
                },

            ],

            "provider": [
                {
                    "@type": "Person",
                    "givenName": "Silvio",
                    "familyName": "Tosatto",
                    "identifier": "https://orcid.org/0000-0003-4525-7793",
                    "name": "Silvio Tosatto",
                    "email": "silvio.tosatto@unipd.it",
                    "url": "https://biocomputingup.it/people/silvio"
                }
            ],

            "encodingFormat": [
                "text/html",
                "application/json"
            ],
            "license": {
                "@type": "CreativeWork",
                "@id": "https://creativecommons.org/licenses/by/4.0/",
                "name": "Creative Commons CC4 Attribution",
                "url": "https://creativecommons.org/licenses/by/4.0/"
              },
        };

        return JSON.stringify(jsonLd);
    }


    async GenerateArticleJsonLdBrowsePage(){

    const jsonLd ={
    "@context": "https://schema.org",
    "@Type": "Dataset",
    "@id":"https://registry.dome-ml.org",
    "http://purl.org/dc/terms/conformsTo": {
      "@id": "https://bioschemas.org/profiles/Dataset/1.0-RELEASE",
      "@type": "CreativeWork"
    },
    "includedInDataCatalog": {
      "@id": "https://registry.dome-ml.org/#DataCatalog"
    },
    "url":"https://registry.dome-ml.org/browse",
    "version":"2.1",
     "name":"DOME Registry",
     "description":"",

      "identifier":"https://registry.dome-ml.org",
      "keywrod":[

      ],
      "creator":{
        "@id": "https://biocomputingup.it/#Organization",
        
      },
      "maintainer": {
        "@type": "Person",
        "givenName": "Omar",
        "familyName": "Attafi",
        "identifier": "https://orcid.org/0000-0001-8210-2390",
        "name": "Omar A. Attafi",
        "email": "omarabdelghani.attafi@phd.unipd.it",
        "url": "https://biocomputingup.it/people"
      },

      "license": {
        "@type": "CreativeWork",
        "@id": "https://creativecommons.org/licenses/by/4.0/",
        "name": "Creative Commons CC4 Attribution",
        "url": "https://creativecommons.org/licenses/by/4.0/"
      },





    }
    return JSON.stringify(jsonLd);

    }

async GenerateArticleJsonLdReviewPage(shortid:string ):Promise<string>{
let review= await this.reviewModel.findOne({shortid:shortid}).exec()
const jsonLd = {
"@context":"https://schema.org",
"@type": "Study",
"@id":"https://registry.dome-ml.org/review/"+ shortid,
"http://purl.org/dc/terms/conformsTo": {
        "@id": "https://bioschemas.org/profiles/Study/0.3-DRAFT",
        "@type": "CreativeWork"
    },
 "includedInDataset":"DOME Registry",
  "citation": {
    "@type": "ScholarlyArticle",
    "@id": review.publication.doi,
    "name":review.publication.title,
    "url": review.publication.doi,
    "sameAs": [
      "https://academic.oup.com/nar/article-lookup/doi/10.1093/nar/gkac1065",
      "https://pubmed.ncbi.nlm.nih.gov/36416266/"
    ]
  }
}

return JSON.stringify(jsonLd);


}


  
}