import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Vehicle } from "../types";
import api from "../services/api";

const ACTIVE_VEHICLE_KEY = "@techtune_active_vehicle_id";
const CACHED_VEHICLES_KEY = "@techtune_cached_vehicles";

// Default fallback vehicles for offline demo reliability
export const DEFAULT_PRESET_VEHICLES: Vehicle[] = [
  {
    id: "preset-lexus-rx350",
    make: "Lexus",
    model: "RX350 Luxury AWD",
    year: 2024,
    plateNumber: "2A-8888",
    color: "Sonic Titanium",
    vin: "JTJBB31U872019482",
  },
  {
    id: "preset-toyota-lc300",
    make: "Toyota",
    model: "Land Cruiser 300 V6 Twin-Turbo",
    year: 2024,
    plateNumber: "2C-9999",
    color: "Pearl White",
    vin: "JTMHY7AJ3M4019284",
  },
  {
    id: "preset-tesla-modely",
    make: "Tesla",
    model: "Model Y Dual Motor AWD",
    year: 2024,
    plateNumber: "2E-7777",
    color: "Deep Blue Metallic",
    vin: "7SAYGDEE1PF829104",
  },
  {
    id: "preset-ford-raptor",
    make: "Ford",
    model: "F-150 Raptor 4x4",
    year: 2024,
    plateNumber: "2D-5555",
    color: "Code Orange",
    vin: "1FTER4EH2MLA81923",
  },
  {
    id: "preset-mercedes-maybach",
    make: "Mercedes-Benz",
    model: "Maybach S680 V12",
    year: 2023,
    plateNumber: "2X-1111",
    color: "Obsidian Black",
    vin: "WDD2231761A091823",
  },
];

interface VehicleState {
  vehicles: Vehicle[];
  activeVehicleId: string | null;
  isLoading: boolean;
  error: string | null;
  fetchVehicles: () => Promise<Vehicle[]>;
  addVehicle: (data: Omit<Vehicle, "id">) => Promise<Vehicle>;
  deleteVehicle: (id: string) => Promise<void>;
  setActiveVehicleId: (id: string) => Promise<void>;
  getActiveVehicle: () => Vehicle;
}

export const useVehicleStore = create<VehicleState>((set, get) => ({
  vehicles: DEFAULT_PRESET_VEHICLES,
  activeVehicleId: DEFAULT_PRESET_VEHICLES[0].id,
  isLoading: false,
  error: null,

  fetchVehicles: async () => {
    set({ isLoading: true, error: null });
    try {
      const activeId = await AsyncStorage.getItem(ACTIVE_VEHICLE_KEY);
      let list: Vehicle[] = [];

      try {
        const remoteVehicles = await api.vehicles.getAll();
        if (Array.isArray(remoteVehicles) && remoteVehicles.length > 0) {
          list = remoteVehicles;
          await AsyncStorage.setItem(CACHED_VEHICLES_KEY, JSON.stringify(list));
        }
      } catch {
        // Fallback to local cache or presets
        const cached = await AsyncStorage.getItem(CACHED_VEHICLES_KEY);
        if (cached) {
          list = JSON.parse(cached);
        } else {
          list = DEFAULT_PRESET_VEHICLES;
        }
      }

      if (list.length === 0) {
        list = DEFAULT_PRESET_VEHICLES;
      }

      const validActiveId =
        activeId && list.some((v) => v.id === activeId)
          ? activeId
          : list[0]?.id || null;

      set({
        vehicles: list,
        activeVehicleId: validActiveId,
        isLoading: false,
      });

      return list;
    } catch (err: any) {
      set({ isLoading: false, error: err?.message || "Failed to load vehicles" });
      return get().vehicles;
    }
  },

  addVehicle: async (data: Omit<Vehicle, "id">) => {
    set({ isLoading: true, error: null });
    try {
      let newVehicle: Vehicle;
      try {
        newVehicle = await api.vehicles.create({
          make: data.make,
          model: data.model,
          year: Number(data.year),
          plateNumber: data.plateNumber || data.licensePlate || "2A-0000",
          color: data.color || "Black",
        });
      } catch {
        // Local fallback creation if backend offline
        newVehicle = {
          id: `veh-${Date.now()}`,
          make: data.make,
          model: data.model,
          year: Number(data.year),
          plateNumber: data.plateNumber || data.licensePlate || "2A-0000",
          color: data.color || "Black",
          vin: data.vin,
        };
      }

      const updated = [newVehicle, ...get().vehicles];
      await AsyncStorage.setItem(CACHED_VEHICLES_KEY, JSON.stringify(updated));
      await AsyncStorage.setItem(ACTIVE_VEHICLE_KEY, newVehicle.id);

      set({
        vehicles: updated,
        activeVehicleId: newVehicle.id,
        isLoading: false,
      });

      return newVehicle;
    } catch (err: any) {
      set({ isLoading: false, error: err?.message || "Failed to add vehicle" });
      throw err;
    }
  },

  deleteVehicle: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      try {
        await api.vehicles.delete(id);
      } catch {
        // Still remove locally if remote fails
      }

      const updated = get().vehicles.filter((v) => v.id !== id);
      const remaining = updated.length > 0 ? updated : DEFAULT_PRESET_VEHICLES;
      const nextActiveId =
        get().activeVehicleId === id ? remaining[0]?.id || null : get().activeVehicleId;

      await AsyncStorage.setItem(CACHED_VEHICLES_KEY, JSON.stringify(remaining));
      if (nextActiveId) {
        await AsyncStorage.setItem(ACTIVE_VEHICLE_KEY, nextActiveId);
      }

      set({
        vehicles: remaining,
        activeVehicleId: nextActiveId,
        isLoading: false,
      });
    } catch (err: any) {
      set({ isLoading: false, error: err?.message || "Failed to delete vehicle" });
      throw err;
    }
  },

  setActiveVehicleId: async (id: string) => {
    await AsyncStorage.setItem(ACTIVE_VEHICLE_KEY, id);
    set({ activeVehicleId: id });
  },

  getActiveVehicle: () => {
    const { vehicles, activeVehicleId } = get();
    return (
      vehicles.find((v) => v.id === activeVehicleId) ||
      vehicles[0] ||
      DEFAULT_PRESET_VEHICLES[0]
    );
  },
}));
