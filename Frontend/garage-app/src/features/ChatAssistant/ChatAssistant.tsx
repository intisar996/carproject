import {
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

import SmartToyIcon from "@mui/icons-material/SmartToy";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import AttachFileIcon from "@mui/icons-material/AttachFile";

type ServiceId =
  | "oil"
  | "wash"
  | "diagnostic"
  | "tire"
  | "ac"
  | "tow";

type ChatIntent =
  | "service_information"
  | "price_estimation"
  | "smart_recommendation"
  | "booking_help"
  | "technician_tracking"
  | "rating_review"
  | "image_inspection"
  | "maintenance_recommendation"
  | "general_car_help";

type Message = {
  role: "user" | "assistant";
  text: string;
  serviceId?: ServiceId | null;
  intent?: ChatIntent;
  recommendation?: string | null;
  imagePreview?: string;
};

type ChatAssistantProps = {
  onSelectService?: (id: ServiceId) => void;
};

type GeminiResult = {
  message: string;
  serviceId?: ServiceId | null;
  intent?: ChatIntent;
  recommendation?: string | null;
};

type GeminiPart =
  | {
      text: string;
    }
  | {
      inline_data: {
        mime_type: string;
        data: string;
      };
    };

type GeminiContent = {
  role: "user" | "model";
  parts: GeminiPart[];
};

const SYSTEM_PROMPT = `
You are the AI assistant for a car service platform in Oman.

Your job is to help users with:
- Car services
- Car maintenance
- Price estimation
- Smart service recommendations
- Smart booking guidance
- Technician tracking
- Ratings and reviews
- Before/during/after service photos
- AI image vehicle inspection
- Maintenance recommendations

GENERAL RULES:
- Answer in the same language as the user.
- Understand Arabic, English, and simple Arabic dialect.
- Understand Gulf/Omani-style Arabic such as:
  "أبي", "ابا", "ابي", "عندي", "وش", "كم", "أبغى", "مكيف خربان", "ابي كفرات".
- Be friendly, concise, and useful.
- Never invent services.
- Never invent prices.
- Never invent technician locations.
- Never invent ETA.
- Never invent booking information.
- Never invent ratings.
- Never claim a service is completed unless the application provides that information.
- Never make a certain mechanical diagnosis.
- For dangerous car problems, recommend professional inspection.
- Recommendations are suggestions only.

AVAILABLE SERVICES:

1. Oil Change
Service ID: oil
- Service fee: 3 OMR
- Engine filter: 4 OMR optional
- Oil interval options: 5,000 km or 10,000 km

2. Car Wash
Service ID: wash
- Small car: 2 OMR
- Large car: 2.5 OMR

3. Vehicle Diagnostic
Service ID: diagnostic
- External inspection + report: 3 OMR
- External inspection + computer + report: 8 OMR

4. Tires
Service ID: tire
- Example tire price: 25 OMR per tire
- Installation: 2 OMR per tire
- User chooses brand, diameter, width, and height ratio

5. AC Service
Service ID: ac
- Example price range: 5–20 OMR
- User chooses the correct AC gas type
- Partial or full refill

6. Tow Truck
Service ID: tow
- Less than 50 km: 30 OMR
- 50–100 km: 40 OMR
- 100–150 km: 50 OMR

FEATURES:

1. LIVE TECHNICIAN TRACKING

After booking, the application may provide:
- Technician location
- Estimated arrival time
- Technician status

Possible statuses:
- On the way
- Arrived
- Service started
- Service completed

Never invent tracking data.
Only mention tracking information if the application provides it.

2. RATING & REVIEW SYSTEM

After service completion users may rate:
- Technician
- Service quality
- Arrival time
- Overall experience

Explain the rating process when asked.
Never invent an actual rating.

3. PRICE ESTIMATION

Help the user estimate prices before booking.

Example:

Engine Oil Change
Service: 3 OMR
Oil: 18 OMR
Filter: 4 OMR
Visit fee: 3 OMR

Estimated Total: 28 OMR

Always call it an estimate.

If the user provides specific values, calculate the estimated total correctly.

4. BEFORE / DURING / AFTER SERVICE PHOTOS

Technicians may upload:
- Before service
- During service
- After service

These images create a service record and improve transparency.

5. AI IMAGE CAR INSPECTION

When the user uploads a vehicle image:
- Analyze only visible issues.
- Look for:
  tire damage,
  cracks,
  scratches,
  dents,
  rust,
  broken lights,
  visible wear,
  obvious external damage.
- Never claim certainty.
- Use phrases such as:
  "appears",
  "may indicate",
  "possible issue".
- Recommend professional inspection where appropriate.

If there is no image but the user wants image inspection:
ask them to upload a clear photo.

6. AI SERVICE RECOMMENDATION

The assistant can use:
- Vehicle model
- Mileage
- Service history
- Previous repairs
- Current symptoms
- Maintenance schedule

Possible recommendations:
- Oil change — Due
- Battery inspection — Recommended
- Tire inspection — Recommended
- Brake inspection — Due soon

Treat recommendations as suggestions, not diagnoses.

7. AI SMART SERVICE BOOKING

The user can describe symptoms naturally.

Example:
"My car is making a loud noise when I turn."

The assistant should:
- Understand the symptom
- Ask useful follow-up questions when needed
- Suggest the most appropriate available service
- Explain why

Only use a serviceId if it matches one of these actual services:
oil, wash, diagnostic, tire, ac, tow.

If a recommended service is not one of the available services:
- Explain the recommendation
- Set serviceId to null
- Do not pretend that the service can be opened or booked.

8. CONVERSATION CONTEXT

Remember previous messages in the current conversation.

Example:

User:
"My car makes a noise."

Assistant:
"Where do you hear the noise?"

User:
"When I turn left."

Assistant:
"That may be related to steering or suspension. I recommend a professional inspection."

Do not treat each message as a completely new conversation.

INTENTS:

Use one of:
- service_information
- price_estimation
- smart_recommendation
- booking_help
- technician_tracking
- rating_review
- image_inspection
- maintenance_recommendation
- general_car_help

JSON RESPONSE:

Return ONLY valid JSON in this exact format:

{
  "message": "your response",
  "serviceId": null,
  "intent": "general_car_help",
  "recommendation": null
}

RULES:
- serviceId can only be:
  oil, wash, diagnostic, tire, ac, tow, or null
- intent must be one of the allowed intents.
- recommendation should be a short recommendation or null.

EXAMPLES:

User:
"أبي أغير زيت"

Response:
{
  "message": "أكيد. خدمة تغيير الزيت متوفرة، وسعر الخدمة 3 ر.ع، ويمكن إضافة فلتر المكينة بـ 4 ر.ع.",
  "serviceId": "oil",
  "intent": "service_information",
  "recommendation": null
}

User:
"سيارتي تصدر صوت لما ألف"

Response:
{
  "message": "قد يكون الصوت مرتبطًا بالتوجيه أو التعليق، لكن لا يمكن تأكيد السبب من الوصف فقط. أنصح بفحص السيارة لدى فني مختص.",
  "serviceId": "diagnostic",
  "intent": "smart_recommendation",
  "recommendation": "Steering/Suspension Inspection"
}

User:
"كم بيكلف تغيير الزيت إذا الزيت 18 والفلتر 4 ورسوم الخدمة 3 ورسوم الزيارة 3؟"

Response:
{
  "message": "التكلفة التقديرية 28 ر.ع.",
  "serviceId": "oil",
  "intent": "price_estimation",
  "recommendation": null
}

User:
"أبي أفحص السيارة من صورة"

Response:
{
  "message": "أكيد. ارفع صورة واضحة للسيارة أو الجزء الذي تريد فحصه، وسأحاول تحديد المشاكل الظاهرة بصريًا.",
  "serviceId": "diagnostic",
  "intent": "image_inspection",
  "recommendation": "Visual vehicle inspection"
}
`;

const quickQuestions = [
  {
    label: "الخدمات",
    question: "ما الخدمات المتاحة؟",
  },
  {
    label: "تغيير الزيت",
    question: "كم سعر تغيير الزيت؟",
  },
  {
    label: "الإطارات",
    question: "أريد إطارات",
  },
  {
    label: "غسيل",
    question: "كم سعر غسيل السيارة؟",
  },
  {
    label: "المكيف",
    question: "عندي مشكلة في المكيف",
  },
  {
    label: "الرافعة",
    question: "أحتاج ونش",
  },
  {
    label: "فحص السيارة",
    question: "أريد فحص سيارتي",
  },
];

const welcomeMessage: Message = {
  role: "assistant",
  text:
    "مرحبًا! 👋 أنا مساعد خدمات السيارات الذكي.\n\nأقدر أساعدك في الخدمات، الأسعار، الصيانة، التوصيات، الحجز، وفحص السيارة بالصور.\n\nكيف أقدر أساعدك؟",
  intent: "general_car_help",
};

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;

      if (typeof result !== "string") {
        reject(new Error("Unable to read image."));
        return;
      }

      const commaIndex = result.indexOf(",");

      if (commaIndex === -1) {
        reject(new Error("Invalid image data."));
        return;
      }

      resolve(result.substring(commaIndex + 1));
    };

    reader.onerror = () => {
      reject(new Error("Failed to read image."));
    };

    reader.readAsDataURL(file);
  });
}

function getServiceName(serviceId: ServiceId): string {
  const names: Record<ServiceId, string> = {
    oil: "تغيير الزيت",
    wash: "غسيل السيارة",
    diagnostic: "فحص السيارة",
    tire: "الإطارات",
    ac: "خدمة المكيف",
    tow: "الرافعة",
  };

  return names[serviceId];
}

export default function ChatAssistant({
  onSelectService,
}: ChatAssistantProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [selectedImage, setSelectedImage] = useState<File | null>(
    null
  );

  const [imagePreview, setImagePreview] = useState<string | null>(
    null
  );

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    welcomeMessage,
  ]);

  async function sendMessage(
    value: string,
    imageFile: File | null = selectedImage
  ) {
    const message = value.trim();

    if (!message && !imageFile) {
      return;
    }

    if (loading) {
      return;
    }

    let preview = imagePreview;

    if (imageFile && !preview) {
      preview = URL.createObjectURL(imageFile);
    }

    const userMessage: Message = {
      role: "user",
      text: message || "أريد فحص هذه الصورة.",
      imagePreview: preview ?? undefined,
    };

    setMessages((previous) => [
      ...previous,
      userMessage,
    ]);

    setInput("");
    setLoading(true);

    try {
      const apiKey =
        import.meta.env.VITE_GEMINI_API_KEY;

      if (!apiKey) {
        throw new Error(
          "Gemini API key is missing. Check your .env.local file."
        );
      }

      const history: GeminiContent[] = messages.map(
        (item) => ({
          role:
            item.role === "assistant"
              ? "model"
              : "user",
          parts: [
            {
              text: item.text,
            },
          ],
        })
      );

      const currentParts: GeminiPart[] = [];

      if (message) {
        currentParts.push({
          text: message,
        });
      }

      if (imageFile) {
        const base64Image =
          await fileToBase64(imageFile);

        currentParts.push({
          inline_data: {
            mime_type: imageFile.type,
            data: base64Image,
          },
        });
      }

      history.push({
        role: "user",
        parts: currentParts,
      });

      const response = await fetch(
         "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },

          body: JSON.stringify({
            systemInstruction: {
              parts: [
                {
                  text: SYSTEM_PROMPT,
                },
              ],
            },

            contents: history,

            generationConfig: {
              temperature: 0.4,
              responseMimeType: "application/json",
              maxOutputTokens: 500,
            },
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(
          "Gemini API Error:",
          data
        );

        throw new Error(
          data?.error?.message ||
            `Gemini API request failed with status ${response.status}.`
        );
      }

      const aiText =
        data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!aiText) {
        console.error(
          "Gemini Response:",
          data
        );

        throw new Error(
          "Gemini returned an empty response."
        );
      }

      const cleanedText = aiText
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      let result: GeminiResult;

      try {
        result =
          JSON.parse(cleanedText) as GeminiResult;
      } catch {
        result = {
          message: aiText,
          serviceId: null,
          intent: "general_car_help",
          recommendation: null,
        };
      }

      const assistantMessage: Message = {
        role: "assistant",
        text:
          result.message ||
          "لم أتمكن من إنشاء إجابة.",
        serviceId:
          result.serviceId ?? null,
        intent:
          result.intent ||
          "general_car_help",
        recommendation:
          result.recommendation ?? null,
      };

      setMessages((previous) => [
        ...previous,
        assistantMessage,
      ]);
    } catch (error) {
      console.error(
        "Chat error:",
        error
      );

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text:
            error instanceof Error
              ? `تعذر الاتصال بالمساعد الذكي.\n\n${error.message}`
              : "تعذر الاتصال بالمساعد الذكي. حاول مرة أخرى.",
          intent:
            "general_car_help",
        },
      ]);
    } finally {
      setLoading(false);

      setSelectedImage(null);
      setImagePreview(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function submit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    sendMessage(input);
  }

  function handleImageChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert(
        "Please select an image file."
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert(
        "Image size must be less than 5 MB."
      );
      return;
    }

    setSelectedImage(file);
    setImagePreview(
      URL.createObjectURL(file)
    );
  }

  function removeSelectedImage() {
    setSelectedImage(null);
    setImagePreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function clearChat() {
    setMessages([welcomeMessage]);

    setSelectedImage(null);
    setImagePreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <>
      {!open && (
        <Box
          sx={{
            position: "fixed",
            right: {
              xs: 18,
              md: 30,
            },
            bottom: {
              xs: 18,
              md: 30,
            },
            zIndex: 1200,
          }}
        >
          <Box
            sx={{
              position: "relative",
            }}
          >
          

            <Button
              onClick={() => setOpen(true)}
              sx={{
                minWidth: 0,
                width: 66,
                height: 66,
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg, var(--dark-oringe), var(--light-oringe))",
                color: "black",
                boxShadow:
                  "0 10px 30px rgba(0,0,0,0.25)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, var(--light-oringe))",
                  transform: "scale(1.05)",
                },
                transition: "0.2s",
              }}
              aria-label="Open AI assistant"
            >
              <SmartToyIcon sx={{ fontSize: 32 }} />
            </Button>
          </Box>
        </Box>
      )}

      {open && (
        <Box
          onClick={() => setOpen(false)}
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: 1200,
            background: "rgba(0,0,0,0.15)",
          }}
        >
          <Paper
            elevation={16}
            onClick={(event) => event.stopPropagation()}
            sx={{
              position: "absolute",
              right: {
                xs: 10,
                sm: 24,
                md: 30,
              },
              bottom: {
                xs: 10,
                sm: 24,
                md: 30,
              },
              width: {
                xs: "calc(100% - 20px)",
                sm: 410,
              },
              height: {
                xs: "calc(100vh - 20px)",
                sm: 650,
              },
              maxHeight: 700,
              borderRadius: 4,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Header */}
            <Box
              sx={{
                px: 2,
                py: 1.6,
                background:
                  "linear-gradient(135deg, var(--dark-oringe))",
                color: "white",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.2,
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background:
                      "rgba(255,255,255,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <SmartToyIcon />
                </Box>

                <Box>
                  <Typography
                    sx={{
                      fontWeight: "bold",
                    }}
                  >
                    مساعد خدمات السيارات
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={{
                      opacity: 0.8,
                    }}
                  >
                    AI Car Assistant
                  </Typography>
                </Box>
              </Box>

              <Box>
                <IconButton
                  onClick={clearChat}
                  sx={{
                    color: "white",
                  }}
                >
                  <IconButton />
                </IconButton>

                <IconButton
                  onClick={() => setOpen(false)}
                  sx={{
                    color: "white",
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            </Box>
            <Box
              sx={{
                flex: 1,
                overflowY: "auto",
                p: 2,
                background: "#f5f7fb",
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
              }}
            >
              {messages.map((message, index) => {
                const isUser =
                  message.role === "user";

                return (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      justifyContent: isUser
                        ? "flex-end"
                        : "flex-start",
                    }}
                  >
                    <Box
                      sx={{
                        maxWidth: "86%",
                      }}
                    >
                      <Box
                        sx={{
                          px: 1.8,
                          py: 1.3,
                          borderRadius: isUser
                            ? "18px 18px 4px 18px"
                            : "18px 18px 18px 4px",
                          background: isUser
                            ? "#0d47a1"
                            : "white",
                          color: isUser
                            ? "white"
                            : "#263238",
                          boxShadow:
                            "0 2px 8px rgba(0,0,0,0.08)",
                        }}
                      >
                        {message.imagePreview && (
                          <Box
                            component="img"
                            src={message.imagePreview}
                            alt="Uploaded vehicle"
                            sx={{
                              width: "100%",
                              maxWidth: 240,
                              maxHeight: 180,
                              objectFit: "cover",
                              borderRadius: 2,
                              display: "block",
                              mb: 1,
                            }}
                          />
                        )}

                        <Typography
                          variant="body2"
                          sx={{
                            whiteSpace: "pre-wrap",
                            lineHeight: 1.75,
                          }}
                        >
                          {message.text}
                        </Typography>

                        {message.recommendation && (
                          <Box
                            sx={{
                              mt: 1.2,
                              px: 1.2,
                              py: 1,
                              borderRadius: 2,
                              background: isUser
                                ? "rgba(255,255,255,0.12)"
                                : "#eef4ff",
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: "bold",
                              }}
                            >
                              Recommended
                            </Typography>

                            <Typography
                              variant="body2"
                              sx={{
                                mt: 0.3,
                              }}
                            >
                              {message.recommendation}
                            </Typography>
                          </Box>
                        )}

                        {message.serviceId &&
                          onSelectService && (
                            <Button
                              fullWidth
                              size="small"
                              variant="contained"
                              sx={{
                                mt: 1.2,
                                borderRadius: 2,
                                background: "#1565c0",
                                color: "white",
                                "&:hover": {
                                  background: "#0d47a1",
                                },
                              }}
                              onClick={() => {
                                onSelectService(
                                  message.serviceId!
                                );
                                setOpen(false);
                              }}
                            >
                              فتح{" "}
                              {getServiceName(
                                message.serviceId
                              )}
                            </Button>
                          )}
                      </Box>
                    </Box>
                  </Box>
                );
              })}

              {loading && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-start",
                  }}
                >
                  <Box
                    sx={{
                      background: "white",
                      px: 2,
                      py: 1.2,
                      borderRadius: 3,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      boxShadow:
                        "0 2px 8px rgba(0,0,0,0.08)",
                    }}
                  >
                    <CircularProgress size={17} />

                    <Typography variant="body2">
                      المساعد يفكر...
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>

            {/* Quick Questions */}
            <Box
              sx={{
                px: 1.5,
                py: 1,
                display: "flex",
                gap: 0.8,
                overflowX: "auto",
                background: "white",
              }}
            >
              {quickQuestions.map((item) => (
                <Button
                  key={item.label}
                  size="small"
                  variant="outlined"
                  disabled={loading}
                  onClick={() =>
                    sendMessage(item.question)
                  }
                  sx={{
                    whiteSpace: "nowrap",
                    borderRadius: 5,
                    fontSize: 11,
                    flexShrink: 0,
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>

            {/* Image Preview */}
            {imagePreview && (
              <Box
                sx={{
                  px: 1.5,
                  py: 1,
                  background: "#eef4ff",
                  borderTop:
                    "1px solid #dce6f7",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Box
                    component="img"
                    src={imagePreview}
                    alt="Selected vehicle"
                    sx={{
                      width: 52,
                      height: 52,
                      objectFit: "cover",
                      borderRadius: 2,
                    }}
                  />

                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: "bold",
                      }}
                    >
                      صورة السيارة جاهزة للفحص
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      اكتب سؤالك ثم اضغط إرسال
                    </Typography>
                  </Box>

                  <IconButton
                    size="small"
                    onClick={removeSelectedImage}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            )}

            {/* Input */}
            <Box
              component="form"
              onSubmit={submit}
              sx={{
                p: 1.5,
                display: "flex",
                gap: 1,
                background: "white",
                borderTop:
                  "1px solid #e0e0e0",
                alignItems: "center",
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/heic,image/heif"
                hidden
                onChange={handleImageChange}
              />

              <IconButton
                type="button"
                disabled={loading}
                onClick={() =>
                  fileInputRef.current?.click()
                }
                sx={{
                  width: 42,
                  height: 42,
                  border:
                    "1px solid #d7dce5",
                }}
                title="Upload vehicle image"
              >
                <ImageOutlinedIcon />
              </IconButton>

              <TextField
                fullWidth
                size="small"
                value={input}
                onChange={(event) =>
                  setInput(event.target.value)
                }
                disabled={loading}
                placeholder="اكتب سؤالك هنا..."
                autoComplete="off"
              />

              <IconButton
                type="submit"
                disabled={
                  loading ||
                  (!input.trim() && !selectedImage)
                }
                sx={{
                  width: 42,
                  height: 42,
                  background: "#0d47a1",
                  color: "white",
                  "&:hover": {
                    background: "#082567",
                  },
                }}
              >
                <SendIcon fontSize="small" />
              </IconButton>
            </Box>

            <Box
              sx={{
                px: 1.5,
                pb: 1,
                background: "white",
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                <AttachFileIcon
                  sx={{
                    fontSize: 13,
                  }}
                />

                AI assistant for car services and maintenance.
              </Typography>
            </Box>
          </Paper>
        </Box>
      )}
    </>
  );
}