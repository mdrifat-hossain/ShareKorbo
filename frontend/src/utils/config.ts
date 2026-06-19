import { Platform } from "react-native";

export const BACKEND_IP: string = "10.15.11.15";

export const BASE_URL =
  BACKEND_IP === "127.0.0.1"
    ? (Platform.OS === "android"
        ? "http://10.0.2.2:8000"
        : "http://localhost:8000")
    : `http://${BACKEND_IP}:8000`;