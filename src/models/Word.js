import mongoose from 'mongoose';
import { every, has, partial } from 'lodash';
import { toJSONPlugin, toObjectPlugin } from './plugins';
import Dialects from '../shared/constants/Dialects';
import wordClass from '../shared/constants/wordClass';

const REQUIRED_DIALECT_KEYS = ['variations', 'dialects', 'pronunciation'];
const REQUIRED_DIALECT_CONSTANT_KEYS = ['code', 'value', 'label'];

const { Schema, Types } = mongoose;
const wordSchema = new Schema({
  word: { type: String, required: true },
  wordClass: {
    type: String,
    default: wordClass.NNC.value,
    enum: Object.values(wordClass).map(({ value }) => value),
  },
  definitions: { type: [{ type: String }], default: [] },
  dialects: {
    type: Object,
    validate: (v) => {
      const dialectValues = Object.values(v);
      return dialectValues.every((dialectValue) => (
        every(REQUIRED_DIALECT_KEYS, partial(has, dialectValue))
        && every(dialectValue.dialects, (dialect) => (
          every(REQUIRED_DIALECT_CONSTANT_KEYS, partial(has, Dialects[dialect]))
        ))
        && Array.isArray(dialectValue.dialects)
        && every(dialectValue.dialects, (dialect) => Dialects[dialect].value)
        && typeof dialectValue.pronunciation === 'string'
        && Array.isArray(dialectValue.variations)
      ));
    },
    required: false,
    default: {},
  },
  pronunciation: { type: String, default: '' },
  isAccented: { type: Boolean, default: false },
  isStandardIgbo: { type: Boolean, default: false },
  variations: { type: [{ type: String }], default: [] },
  frequency: { type: Number },
  synonyms: { type: [{ type: Types.ObjectId, ref: 'Word' }], default: [] },
  antonyms: { type: [{ type: Types.ObjectId, ref: 'Word' }], default: [] },
  hypernyms: { type: [{ type: Types.ObjectId, ref: 'Word' }], default: [] },
  hyponyms: { type: [{ type: Types.ObjectId, ref: 'Word' }], default: [] },
  stems: { type: [{ type: String }], default: [] },
  nsibidi: { type: String, default: '' },
  isComplete: { type: Boolean, default: false },
}, { toObject: toObjectPlugin, timestamps: true });

wordSchema.index({
  word: 'text',
  variations: 'text',
  dialects: 'text',
  nsibidi: 'text',
});

toJSONPlugin(wordSchema);

const WordModel = mongoose.model('Word', wordSchema);
WordModel.syncIndexes();

export default WordModel;
