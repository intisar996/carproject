
import { useState } from "react";
import { useParams } from "react-router-dom";
import {Alert,Box,Button,CircularProgress,Container,Paper,Stack,
  TextField,Typography,} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import agent from "../../app/api/agent";
import axios from "axios";




export default function RatingPage() {
  const { trackingToken } = useParams<{ trackingToken: string }>();

  const [stars, setStars] = useState(0);
  const [hoveredStars, setHoveredStars] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!trackingToken) {
      setError("Invalid rating link. Please check your email.");
      return;
    }

    if (stars < 1 || stars > 5) {
      setError("Please select a rating from 1 to 5 stars.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await agent.Ratings.submit(trackingToken,
        {
          stars,
          comment: comment.trim() || null,
        }
      );

      setSubmitted(true);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const responseMessage =
          err.response?.data?.message ||
          err.response?.data?.error;

        setError(
          responseMessage ||
            "Unable to submit your rating. Please try again."
        );
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 4, md: 8 } }}>
      <Paper
        elevation={3}
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 3,
          textAlign: "center",
          bgcolor: "var(--dark-oringe)",
        }}
      >
        <Typography
          variant="overline"
          sx={{ color: "var(--navy-color)", fontWeight: 700 }}
        >
          CAR SERVICES
        </Typography>

        {submitted ? (
          <Stack spacing={2} alignItems="center" sx={{ mt: 2 }}>
        
            <Typography variant="h5" sx={{fontWeight :700 }} color="#101820">
              Thank You!
            </Typography>

            <Typography color="text.secondary">
              Your rating has been submitted successfully.
              We appreciate your feedback.
            </Typography>
          </Stack>
        ) : (
          <>
            <Typography
              variant="h4"
              sx={{ color: "#101820", mt: 2, mb: 1,fontWeight :700 }}
            >
              Rate Your Service
            </Typography>

            <Typography color="text.secondary" sx={{ mb: 3 }}>
              How was your car service experience?
            </Typography>

            <Box
              role="group"
              aria-label="Choose a rating from 1 to 5 stars"
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: { xs: 0.5, sm: 1 },
                mb: 1,
              }}
            >
              {[1, 2, 3, 4, 5].map((value) => {
                const active = value <= (hoveredStars || stars);

                return (
                  <Box
                    key={value}
                    component="button"
                    type="button"
                    aria-label={`${value} ${value === 1 ? "star" : "stars"}`}
                    aria-pressed={stars === value}
                    onClick={() => setStars(value)}
                    onMouseEnter={() => setHoveredStars(value)}
                    onMouseLeave={() => setHoveredStars(0)}
                    onFocus={() => setHoveredStars(value)}
                    onBlur={() => setHoveredStars(0)}
                    sx={{
                      border: 0,
                      background: "transparent",
                      cursor: "pointer",
                      p: 0.25,
                      display: "flex",
                      color: active ? "#F5A623" : "#A7B0BE",
                    }}
                  >
                    {active ? (
                      <StarIcon sx={{ fontSize: { xs: 42, sm: 50 } }} />
                    ) : (
                      <StarBorderIcon
                        sx={{ fontSize: { xs: 42, sm: 50 } }}
                      />
                    )}
                  </Box>
                );
              })}
            </Box>

            <Typography sx={{ mb: 3, color: "#101820", minHeight: 24 }}>
              {stars === 0
                ? "Select your rating"
                : [
                    "",
                    "Poor",
                    "Fair",
                    "Good",
                    "Very Good",
                    "Excellent",
                  ][hoveredStars || stars]}
            </Typography>

            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Comment (optional)"
              placeholder="Tell us about your experience..."
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              helperText={`${comment.length}/1000`}
              sx={{ mb: 3, textAlign: "left" }}
            />

            {error && (
              <Alert severity="error" sx={{ mb: 2, textAlign: "left" }}>
                {error}
              </Alert>
            )}

            <Button
              fullWidth
              variant="contained"
              onClick={handleSubmit}
              disabled={loading || stars === 0 || !trackingToken}
              sx={{
                py: 1.5,
                bgcolor: "#1677FF",
                fontWeight: 700,
                "&:hover": { bgcolor: "#125FCC" },
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Submit Rating"
              )}
            </Button>
          </>
        )}
      </Paper>
    </Container>
  );
}
