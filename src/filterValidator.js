import * as Ajv from 'ajv';

export class FilterValidator {
  constructor(schemaProperties) {
    const ajv = new Ajv();
    const schema = {
      type: 'object',
      properties: schemaProperties,
      required: Object.keys(schemaProperties),
    };
    this.validate = ajv.compile(schema);
  }
}
