import mongoose from '@/database';
import Slugify from '../../utils/Slugify';

const ProjectSchema = new mongoose.Schema({
  Materia: {
    type: String,
    required: true,
    unique: true,
  },
  slug: {
    type: String,
    unique: true,
  },
  Professores: {
    type: [String],
    required: true,
  },
  Cursos: {
    type: [String],
    required: true,
    lowercase: true,
  },
  featuredImage: {
    type: String,
    required: false, //deixado como false para facilitar manipulação e o dev não acredita que seja necessário para o contexto aplicado, mas está funcional
  },
  images: [{ type: String }],

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

ProjectSchema.pre('save', function (next) {
  const materia = this.Materia;
  this.slug = Slugify(materia);
  next();
});

export default mongoose.model('Project', ProjectSchema);
