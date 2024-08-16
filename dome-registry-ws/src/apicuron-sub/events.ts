import { SubmitWizards } from "src/review/dto/submit-wizard.dto";

export class WizardsCreatedEvent {
  constructor(
    public readonly curator_id: string,
    public readonly timestamp: number,
    public readonly ressource_uri: string,
    public readonly activity_term: string,
    public readonly ressource_id: string
  ) {}
}
