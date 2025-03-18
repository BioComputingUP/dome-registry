import { Module } from '@nestjs/common';
import { CaslAbilityFactory } from './casl-ability.factory';

import { ReviewModule } from 'src/review/review.module';
@Module({
    imports: [ReviewModule],
    providers:[CaslAbilityFactory],
    exports: [CaslAbilityFactory],
})
export class CaslModule {}
