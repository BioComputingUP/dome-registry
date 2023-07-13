import {IsBoolean, IsDefined, IsIn, IsInt, IsString, Max, MaxLength, Min} from "class-validator";
import {Transform, Type} from "class-transformer";


export class ListReviewsDto {

    @IsInt()
    @Min(0)
    @Type(() => Number)
    skip: number = 0;

    @IsInt()
    @Min(0)
    @Max(1000)
    @Type(() => Number)
    limit: number = 100;

    @IsString()
    @MaxLength(100)
    @Type(() => String)
    text: string = '';

    @IsBoolean()
    @Type(() => String)
    @Transform(({ value }) => value === 'true')
    public: boolean = true;

    @Type(() => String)
    @IsIn(['publication.year', 'publication.title', 'publication.authors', 'score'])
    sort: string = 'date';

    @IsBoolean()
    @Type(() => String)
    @Transform(({ value} ) => value === 'true')
    asc: boolean = true;

}
