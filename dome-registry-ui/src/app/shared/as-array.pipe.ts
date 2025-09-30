import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'asArray' })
export class AsArrayPipe implements PipeTransform {
  transform<T>(value: T | T[] | null | undefined): T[] {
    if (Array.isArray(value)) {
      return value;
    }
    if (value === null || value === undefined) {
      return [];
    }
    return [value] as unknown as T[];
  }
}
