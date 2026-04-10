import { DefaultNamingStrategy, NamingStrategyInterface } from 'typeorm';

/**
 * Converts camelCase property names to snake_case column names.
 * This ensures PostgreSQL columns follow the snake_case convention
 * while TypeScript code uses camelCase.
 */
export class SnakeCaseNamingStrategy
  extends DefaultNamingStrategy
  implements NamingStrategyInterface
{
  tableName(className: string, customName: string): string {
    return customName ?? this.toSnakeCase(className);
  }

  columnName(
    propertyName: string,
    customName: string,
    embeddeds: string[],
  ): string {
    return customName ?? this.toSnakeCase(propertyName);
  }

  relationName(propertyName: string): string {
    return this.toSnakeCase(propertyName);
  }

  joinColumnName(relationName: string, referencedColumnName: string): string {
    return this.toSnakeCase(`${relationName}_${referencedColumnName}`);
  }

  joinTableName(
    firstTableName: string,
    secondTableName: string,
    firstPropertyName: string,
  ): string {
    return this.toSnakeCase(`${firstTableName}_${firstPropertyName}_${secondTableName}`);
  }

  joinTableColumnName(
    tableName: string,
    propertyName: string,
    columnName: string,
  ): string {
    return this.toSnakeCase(`${tableName}_${columnName ?? propertyName}`);
  }

  private toSnakeCase(str: string): string {
    return str
      .replace(/([A-Z])/g, '_$1')
      .toLowerCase()
      .replace(/^_/, '');
  }
}
