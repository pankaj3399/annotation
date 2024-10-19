
import { Schema, model, models } from 'mongoose';

const templateSchema = new Schema({
    name: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
    content: { type: String, required: true },
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  });
  
  export const Template = models?.Template || model('Template', templateSchema);