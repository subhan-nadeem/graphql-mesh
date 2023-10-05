import { GraphQLScalarType } from 'graphql';
import { GraphQLDateTime } from 'graphql-scalars';
import moment from 'moment';

export const GraphQLFile = new GraphQLScalarType({
  name: 'File',
  description: 'The `File` scalar type represents a file upload.',
  extensions: {
    codegenScalarType: 'File',
  },
});

export const GraphQLVoid = new GraphQLScalarType({
  name: 'Void',
  description: 'Represents empty values',
  serialize: () => '',
  extensions: {
    codegenScalarType: 'void',
  },
});

export const ObjMapScalar = new GraphQLScalarType({
  name: 'ObjMap',
  serialize: value => JSON.stringify(value),
  parseValue: value => JSON.parse(value.toString()),
  parseLiteral: ast => {
    if (ast.kind === 'StringValue') {
      return JSON.parse(ast.value);
    }
    return null;
  },
});

// helper to check if the date-time string is RFC 3339 compliant
const validateDateTime = (dateTimeString: string) => {
  dateTimeString =
    dateTimeString === null || dateTimeString === void 0 ? void 0 : dateTimeString.toUpperCase();
  // It is a combination of the date and time regex that is also used in the GraphQL Scalars package.
  // https://the-guild.dev/graphql/scalars/docs/scalars/date-time
  const RFC_3339_REGEX =
    /^(\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9]|60))(\.\d{1,})?(([Z])|([+|-]([01][0-9]|2[0-3]):[0-5][0-9]))$/;
  // Validate the structure of the date-string
  if (!RFC_3339_REGEX.test(dateTimeString)) {
    return false;
  }
  // Check if it is a correct date using the javascript Date parse() method.
  const time = Date.parse(dateTimeString);
  if (time !== time) {
    // eslint-disable-line
    return false;
  }
  // Split the date-time-string up into the string-date and time-string part.
  // and check whether these parts are RFC 3339 compliant.
  const index = dateTimeString.indexOf('T');
  const dateString = dateTimeString.substr(0, index);
  const timeString = dateTimeString.substr(index + 1);
  return (0, exports.validateDate)(dateString) && (0, exports.validateTime)(timeString);
};

export const GraphQLCustomDateTime = new GraphQLScalarType({
  name: 'CustomDateTime',
  description:
    'Custom DateTime scalar that wraps GraphQLDateTimeConfig and converts non-RFC 3339 strings to RFC 3339.',
  serialize: value => {
    if (typeof value === 'string' && !validateDateTime(value)) {
      // If the value doesn't match the RFC 3339, convert it to RFC 3339
      const formattedDate = moment(value).toISOString();
      return GraphQLDateTime.serialize(formattedDate).toISOString();
    }
    return GraphQLDateTime.serialize(value).toISOString();
  },
  parseValue: GraphQLDateTime.parseValue,
  parseLiteral: GraphQLDateTime.parseLiteral,
});
