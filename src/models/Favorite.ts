import mongoose, { type Document, type Schema } from "mongoose";

export interface IFavorite extends Document {
  user: mongoose.Types.ObjectId;
  property: mongoose.Types.ObjectId;
}

const favoriteSchema: Schema<IFavorite> = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Property",
    required: true,
  },
});

export default mongoose.model<IFavorite>("Favorite", favoriteSchema);

