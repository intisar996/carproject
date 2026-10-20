/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";

import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap,
} from "react-leaflet";

import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerShadowPng from "leaflet/dist/images/marker-shadow.png";

import agent from "../../app/api/agent";

const customIcon = new L.Icon({
    iconUrl: markerIconPng,
    shadowUrl: markerShadowPng,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

interface TrackingData {
    requestId: number;
    assignmentId: number;
    garageName: string;
    technicianName: string;
    status: string;
    latitude: number | null;
    longitude: number | null;
}

function RecenterMap({
    position,
}: {
    position: { lat: number; lng: number } | null;
}) {
    const map = useMap();

    useEffect(() => {
        if (position) {
            map.panTo([position.lat, position.lng]);
        }
    }, [position, map]);

    return null;
}

export default function CustomerTracking() {
    const [tracking, setTracking] = useState<TrackingData | null>(null);

    const [location, setLocation] = useState<{
        lat: number;
        lng: number;
    } | null>(null);

    const [status, setStatus] = useState(
        "Loading tracking information..."
    );

    useEffect(() => {
        const token =
            window.location.pathname.split("/track/")[1];

        if (!token) {
            setStatus("Invalid tracking link");
            return;
        }

        const loadTracking = async () => {
            try {
                const data =
                    await agent.Tracking.getTracking(token);

                setTracking(data);

                if (
                    data.latitude != null &&
                    data.longitude != null
                ) {
                    setLocation({
                        lat: data.latitude,
                        lng: data.longitude,
                    });
                }

                setStatus("Connected");
            } catch (error) {
                console.error(error);
                setStatus(
                    "Unable to load tracking information"
                );
            }
        };

        loadTracking();
    }, []);

    useEffect(() => {
        if (!tracking?.assignmentId) {
            return;
        }

        const client = new Client({
            webSocketFactory: () =>
                new SockJS(
                    "http://localhost:8080/ws-tracking"
                ),

            reconnectDelay: 5000,

            onConnect: () => {
                setStatus("Live tracking connected");

                client.subscribe(
                    `/topic/location/${tracking.assignmentId}`,
                    (message) => {
                        const data = JSON.parse(
                            message.body
                        );

                        if (
                            data.latitude != null &&
                            data.longitude != null
                        ) {
                            setLocation({
                                lat: data.latitude,
                                lng: data.longitude,
                            });
                        }

                        if (data.status) {
                            setTracking((previous) =>
                                previous
                                    ? {
                                          ...previous,
                                          status: data.status,
                                      }
                                    : previous
                            );
                        }

                        setStatus(
                            "Technician location updated"
                        );
                    }
                );
            },

            onStompError: () => {
                setStatus(
                    "WebSocket connection error"
                );
            },

            onWebSocketError: () => {
                setStatus(
                    "Unable to connect to the server"
                );
            },
        });

        client.activate();

        return () => {
            client.deactivate();
        };
    }, [tracking?.assignmentId]);

    if (!tracking) {
        return (
            <div
                style={{
                    padding: 30,
                    textAlign: "center",
                }}
            >
                <h2>{status}</h2>
            </div>
        );
    }

    const defaultPosition = location ?? {
        lat: 23.588,
        lng: 58.3829,
    };

    return (
        <div
            style={{
                height: "calc(100vh - 80px)",
                width: "100%",
                position: "relative",
            }}
        >
            <div
                style={{
                    padding: "15px 20px",
                    background: "#0f172a",
                    color: "white",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <div>
                    <strong>
                        Technician Tracking
                    </strong>

                    <div
                        style={{
                            fontSize: 13,
                        }}
                    >
                        {tracking.garageName}
                    </div>
                </div>

                <div>{status}</div>
            </div>

            <div
                style={{
                    padding: "10px 20px",
                    background: "white",
                    zIndex: 1000,
                    position: "relative",
                }}
            >
                <strong>Technician:</strong>{" "}
                {tracking.technicianName}

                {" | "}

                <strong>Status:</strong>{" "}
                {tracking.status}
            </div>

            <MapContainer
                center={[
                    defaultPosition.lat,
                    defaultPosition.lng,
                ]}
                zoom={14}
                style={{
                    height: "calc(100% - 90px)",
                    width: "100%",
                }}
            >
                <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {location && (
                    <Marker
                        position={[
                            location.lat,
                            location.lng,
                        ]}
                        icon={customIcon}
                    >
                        <Popup>
                            Current technician location
                        </Popup>
                    </Marker>
                )}

                <RecenterMap position={location} />
            </MapContainer>
        </div>
    );
}
