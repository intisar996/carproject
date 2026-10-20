import { useEffect, useState } from "react";

import {Alert,Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
} from "@mui/material";

import { useAppDispatch, useAppSelector } from "../../store/configureStore";

import {
  addGarageServiceOptionAsync,
  fetchGarageServiceOptionsAsync,
  updateGarageServiceOptionAsync,
} from "./garageServiceOptionsSlice";

import { fetchGaragesAsync } from "./garagesSlice";

import agent from "../../app/api/agent";

import type {
  ServiceItem,
  ServiceOption,
} from "../../app/models/Service";

import type {
  GarageServiceOption,
} from "../../app/models/GarageServiceOption";
import { t } from "i18next";

export default function GarageServiceOptions() {
  const dispatch = useAppDispatch();

  const user = useAppSelector(
    (state) => state.account.user
  );

  const {
    items: garages,
    status: garagesStatus,
  } = useAppSelector(
    (state) => state.garages
  );

  const {
    items,
    status,
    error,
  } = useAppSelector(
    (state) => state.garageServiceOptions
  );

  const ownerId = user?.userId ?? null;

  const [selectedGarageId, setSelectedGarageId] =
    useState<number | null>(null);

  const [services, setServices] =
    useState<ServiceItem[]>([]);

  const [serviceOptions, setServiceOptions] =
    useState<ServiceOption[]>([]);

  const [selectedServiceId, setSelectedServiceId] =
    useState<number | "">("");

  const [selectedOptionId, setSelectedOptionId] =
    useState<number | "">("");

  const [price, setPrice] = useState("");

  const [isAvailable, setIsAvailable] =
    useState(true);

  const [open, setOpen] = useState(false);

  const [editingOption, setEditingOption] =
    useState<GarageServiceOption | null>(null);

  const [catalogLoading, setCatalogLoading] =
    useState(false);

  useEffect(() => {
    if (ownerId === null) return;

    void dispatch(
      fetchGaragesAsync(ownerId)
    );
  }, [dispatch, ownerId]);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const result =
          await agent.Catalog.services();

        setServices(result);
      } catch {
        setServices([]);
      }
    };

    void loadServices();
  }, []);

  useEffect(() => {
    if (!selectedServiceId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setServiceOptions([]);
      return;
    }

    const loadOptions = async () => {
      try {
        setCatalogLoading(true);

        const result =
          await agent.Catalog.options(
            Number(selectedServiceId)
          );

        setServiceOptions(result);
      } catch {
        setServiceOptions([]);
      } finally {
        setCatalogLoading(false);
      }
    };

    void loadOptions();
  }, [selectedServiceId]);

  const handleGarageChange = (
    garageId: number | null
  ) => {
    setSelectedGarageId(garageId);

    setSelectedServiceId("");
    setSelectedOptionId("");
    setServiceOptions([]);
    setEditingOption(null);

    if (garageId !== null) {
      void dispatch(
        fetchGarageServiceOptionsAsync(
          Number(garageId)
        )
      );
    }
  };

  const handleOpenAdd = () => {
    setEditingOption(null);

    setSelectedServiceId("");
    setSelectedOptionId("");
    setServiceOptions([]);

    setPrice("");
    setIsAvailable(true);

    setOpen(true);
  };

  const handleOpenEdit = (
    item: GarageServiceOption
  ) => {
    setEditingOption(item);

    setSelectedServiceId(
      item.serviceOptionId
    );

    setSelectedOptionId(
      item.serviceOptionId
    );

    setPrice(String(item.price));

    setIsAvailable(
      item.isAvailable
    );

    setOpen(true);
  };

  const handleClose = () => {
    if (status === "saving") return;

    setOpen(false);
    setEditingOption(null);

    setSelectedServiceId("");
    setSelectedOptionId("");
    setServiceOptions([]);

    setPrice("");
    setIsAvailable(true);
  };

  const handleSave = async () => {
    if (
      !selectedGarageId ||
      !selectedOptionId ||
      !price
    ) {
      return;
    }

    const values = {
      serviceOptionId:
        Number(selectedOptionId),

      price: Number(price),

      isAvailable,
    };

    if (editingOption) {
      const result = await dispatch(
        updateGarageServiceOptionAsync({
          garageId: Number(
            selectedGarageId
          ),

          garageOptionId:
            editingOption.garageOptionId,

          values,
        })
      );

      if (
        updateGarageServiceOptionAsync.fulfilled.match(
          result
        )
      ) {
        await dispatch(
          fetchGarageServiceOptionsAsync(
            Number(selectedGarageId)
          )
        );

        handleClose();
      }

      return;
    }

    const result = await dispatch(
      addGarageServiceOptionAsync({
        garageId: Number(
          selectedGarageId
        ),

        values,
      })
    );

    if (
      addGarageServiceOptionAsync.fulfilled.match(
        result
      )
    ) {
      await dispatch(
        fetchGarageServiceOptionsAsync(
          Number(selectedGarageId)
        )
      );

      handleClose();
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700 }}
          >
            {t("ServiceOptions")}
          </Typography>

          <Typography color="text.secondary">
            {t("ManageGarageServices")}
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={handleOpenAdd}
          disabled={!selectedGarageId}
        >
          Add Service Option
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              mb: 2,
            }}
          >
            Select Garage
          </Typography>

          <FormControl fullWidth>
            <InputLabel id="garage-select-label">
              Garage
            </InputLabel>

            <Select
              labelId="garage-select-label"
              value={selectedGarageId}
              label="Garage"
              onChange={(event) => {
                const value =
                  event.target.value;

                handleGarageChange(
                  value === null
                    ? null
                    : Number(value)
                );
              }}
            >
              {garagesStatus === "loading" ? (
                <MenuItem disabled>
                  Loading garages...
                </MenuItem>
              ) : garages.length === 0 ? (
                <MenuItem disabled>
                  No garages found
                </MenuItem>
              ) : (
                garages.map((garage) => (
                  <MenuItem
                    key={garage.id}
                    value={garage.id}
                  >
                    {garage.name}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      {!selectedGarageId ? (
        <Card>
          <CardContent>
            <Typography
              sx={{
                textAlign: "center",
              }}
              color="text.secondary"
            >
              Please select a garage to view
              its service options.
            </Typography>
          </CardContent>
        </Card>
      ) : error ? (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      ) : status === "loading" ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            py: 6,
          }}
        >
          <CircularProgress />
        </Box>
      ) : items.length === 0 ? (
        <Card>
          <CardContent>
            <Typography
              sx={{
                textAlign: "center",
              }}
              color="text.secondary"
            >
              No service options have been
              added to this garage yet.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
            },
            gap: 2,
          }}
        >
          {items.map((item) => (
            <Card
              key={item.garageOptionId}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems:
                      "flex-start",
                    mb: 2,
                  }}
                >
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                      }}
                    >
                      {item.serviceName}
                    </Typography>

                    <Typography color="text.secondary">
                      {item.optionType}
                    </Typography>
                  </Box>

                  <Typography
                    sx={{
                      fontWeight: 700,
                    }}
                  >
                    {item.price} OMR
                  </Typography>
                </Box>

                {item.optionSize && (
                  <Typography variant="body2">
                    Size: {item.optionSize}
                  </Typography>
                )}

                {item.optionBrand && (
                  <Typography variant="body2">
                    Brand: {item.optionBrand}
                  </Typography>
                )}

                <Box
                  sx={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems: "center",
                    mt: 2,
                  }}
                >
                  <Typography
                    variant="body2"
                    color={
                      item.isAvailable
                        ? "success.main"
                        : "text.secondary"
                    }
                  >
                    {item.isAvailable
                      ? "Available"
                      : "Unavailable"}
                  </Typography>

                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() =>
                      handleOpenEdit(item)
                    }
                  >
                    Edit
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editingOption
            ? "Edit Service Option"
            : "Add Service Option"}
        </DialogTitle>

        <DialogContent>
          {editingOption ? (
            <Box
              sx={{
                mt: 2,
                p: 2,
                border: "1px solid",
                borderColor:
                  "divider",
                borderRadius: 2,
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                }}
              >
                {editingOption.serviceName}
              </Typography>

              <Typography color="text.secondary">
                {editingOption.optionType}
                {editingOption.optionSize
                  ? ` - ${editingOption.optionSize}`
                  : ""}
                {editingOption.optionBrand
                  ? ` - ${editingOption.optionBrand}`
                  : ""}
              </Typography>
            </Box>
          ) : (
            <>
              <FormControl
                fullWidth
                margin="normal"
              >
                <InputLabel>
                  Service
                </InputLabel>

                <Select
                  value={selectedServiceId}
                  label="Service"
                  onChange={(event) => {
                    setSelectedServiceId(
                      event.target.value === null
                        ? ""
                        : Number(
                            event.target.value
                          )
                    );

                    setSelectedOptionId("");
                  }}
                >
                  {services.map((service) => (
                    <MenuItem
                      key={
                        service.serviceId
                      }
                      value={
                        service.serviceId
                      }
                    >
                      {service.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl
                fullWidth
                margin="normal"
              >
                <InputLabel>
                  Service Option
                </InputLabel>

                <Select
                  value={selectedOptionId}
                  label="Service Option"
                  disabled={
                    !selectedServiceId
                  }
                  onChange={(event) => {
                    setSelectedOptionId(
                      event.target.value === null
                        ? ""
                        : Number(
                            event.target.value
                          )
                    );
                  }}
                >
                  {catalogLoading ? (
                    <MenuItem disabled>
                      Loading...
                    </MenuItem>
                  ) : (
                    serviceOptions.map(
                      (option) => (
                        <MenuItem
                          key={
                            option.serviceOptionId
                          }
                          value={
                            option.serviceOptionId
                          }
                        >
                          {option.type}

                          {option.size
                            ? ` - ${option.size}`
                            : ""}

                          {option.brand
                            ? ` - ${option.brand}`
                            : ""}
                        </MenuItem>
                      )
                    )
                  )}
                </Select>
              </FormControl>
            </>
          )}

          <TextField
            fullWidth
            margin="normal"
            label="Price"
            type="number"
            value={price}
            onChange={(event) =>
              setPrice(
                event.target.value
              )
            }
            slotProps={{
              htmlInput: {
                min: 0,
                step: "0.001",
              },
            }}
          />

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent:
                "space-between",
              mt: 2,
            }}
          >
            <Typography>
              Available
            </Typography>

            <Switch
              checked={isAvailable}
              onChange={(event) =>
                setIsAvailable(
                  event.target.checked
                )
              }
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={handleClose}
            disabled={
              status === "saving"
            }
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleSave}
            disabled={
              status === "saving" ||
              !selectedGarageId ||
              !selectedOptionId ||
              !price
            }
          >
            {status === "saving" ? (
              <CircularProgress
                size={22}
              />
            ) : editingOption ? (
              "Update"
            ) : (
              "Add"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}