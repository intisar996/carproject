
export interface CreateRatingRequest {
  stars: number;
  comment: string | null;
}


export interface RatingResponse {
  stars: number;
  comment: string | null;
  createdAt: string;
}