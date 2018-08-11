// @flow
import React from 'react'
import { FormattedDate } from 'react-intl'
import roundTo from 'round-to'
import { fromLatLon } from 'utm'
import sexagesimal from '@mapbox/sexagesimal'

import { Consumer as FieldTranslationConsumer } from './FieldTranslationContext'
import { Consumer as SettingsConsumer } from './SettingsContext'
import { guessType, parseDate, coerceValue } from '../utils/field_types'
import { translateOrPretty } from '../utils/strings'

import * as FIELD_TYPES from '../constants/field_types'
import * as COORD_FORMATS from '../constants/coord_formats'
import { NULL, UNDEFINED } from '../constants/field_values.js'
import { LOCATION } from '../constants/special_fieldkeys'

type Props = {
  // The field (prop) name including a dot-separated heirarchy e.g.
  // `{ foo: { bar: 'qux' } }` has a fieldkey `foo.bar`
  // The fieldkey is used to look up any user (custom) translations which are
  // passed in by using the FieldTranslationProvider
  fieldkey?: string,
  // The field value to format
  value: any,
  // The field type, this can be defined for a dataset, but the actual field
  // value could be a different type, e.g. a field with type "date" could have a
  // field with value undefined or a string which is not a valid date
  type?: $Values<typeof FIELD_TYPES>
}

/**
 * Format a value from a form, either by guessing the type or trying to coerce
 * the value to a type specified by `fieldType`. An optional `fieldkey` is used
 * to look up a translated value which can be passed by FieldTranslationProvider
 */
const FormattedValue = ({ fieldkey, value, type: fieldType }: Props) => {
  if (fieldkey === LOCATION) fieldType = FIELD_TYPES.LOCATION
  // The type of the value could be different than the type of the field
  let valueType = guessType(value)
  let coercedValue

  if (valueType !== fieldType && fieldType) {
    coercedValue = coerceValue(value, fieldType)
    if (coercedValue !== null) {
      valueType = fieldType
      value = coercedValue
    }
  }

  switch (valueType) {
    case FIELD_TYPES.DATE:
      const parsedDate = parseDate(value)
      if (parsedDate === null) return value
      return (
        <FormattedDate
          value={parsedDate}
          year="numeric"
          month="long"
          day="2-digit"
        />
      )
    case FIELD_TYPES.LOCATION:
      return (
        <SettingsConsumer>
          {({ coordFormat }) => formatLocation(value, coordFormat)}
        </SettingsConsumer>
      )
    case FIELD_TYPES.NUMBER:
    case FIELD_TYPES.UUID:
      return value
    case FIELD_TYPES.IMAGE_URL:
    case FIELD_TYPES.VIDEO_URL:
    case FIELD_TYPES.MEDIA_URL:
    case FIELD_TYPES.AUDIO_URL:
    case FIELD_TYPES.URL:
      return (
        <a href={value} target="_blank" rel="noopener noreferrer">
          {value}
        </a>
      )
    case FIELD_TYPES.STRING:
    case FIELD_TYPES.BOOLEAN:
    case NULL:
    case UNDEFINED:
      return (
        <FieldTranslationConsumer>
          {({ valueTranslations: translations }) =>
            translateOrPretty(value, fieldkey ? translations[fieldkey] : {})
          }
        </FieldTranslationConsumer>
      )
    case FIELD_TYPES.ARRAY:
      return value.map((v, i) => (
        <React.Fragment key={i}>
          <FormattedValue fieldkey={fieldkey} value={v} />
          {i + 1 === value.length ? '' : ', '}
        </React.Fragment>
      ))
  }
}

export default FormattedValue

function formatLocation(
  coords: [number, number],
  format: $Values<typeof COORD_FORMATS>
) {
  if (!(Array.isArray(coords) && coords.length === 2)) return coords
  switch (format) {
    case COORD_FORMATS.DEC_DEG:
      return coords.map(coord => roundTo(coord, 5)).join(', ')
    case COORD_FORMATS.DEG_MIN_SEC:
      return sexagesimal
        .formatPair({ lon: coords[0], lat: coords[1] })
        .replace(/'/g, '’')
        .replace(/"/g, '”')
    case COORD_FORMATS.UTM:
      const utm = fromLatLon(coords[1], coords[0])
      return `X ${roundTo(utm.easting, 1)}, Y ${roundTo(
        utm.northing,
        1
      )} — UTM ${utm.zoneNum}${utm.zoneLetter}`
  }
}
