import { SubmitWizards } from "src/review/dto/submit-wizard.dto";
import { ReviewDocument } from "src/review/review.schema";
import { User } from "src/user/user.schema";

export class WizardsCreatedEvent {
  constructor(
    public curator_orcid: string,
    public entity_uri: string,
    public resource_id: string,
    public timestamp: string,
    public activity_term: string
  ) {}

  toObject() {
    return {
      curator_orcid: this.curator_orcid,
      entity_uri: this.entity_uri,
      resource_id: this.resource_id,
      timestamp: this.timestamp,
      activity_term: this.activity_term,
    };
  }
}
