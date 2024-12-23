import { deepEqual } from "node:assert";
import test from "node:test";
import request from "supertest";
import fs from "fs";
import { createApp } from "./app";
import { convertTemperature } from "./features/temperature/logic";
import { convertVolume } from "./features/volume/logic";

test("App works!", async () => {
  const app = createApp();
  const result = await request(app).get("/");

  deepEqual(result.status, 200);
});

test("GET /temperature", async () => {
  const app = createApp();
  const result = await request(app).get("/temperature");

  deepEqual(result.status, 200);
  deepEqual(result.body, ["Kelvin", "Celsius", "Fahrenheit"]);
});

test("POST /temperature/convert", async () => {
  const app = createApp();
  const testConvertTemperature = {
    fromUnit: "C",
    toUnit: "F",
    value: "25",
  };
  const result = await request(app)
    .post("/temperature/convert")
    .send(testConvertTemperature);
  const expectedValue = convertTemperature("C", "F", 25);
  deepEqual(result.status, 200);
  deepEqual(result.body.convertedValue, expectedValue);
});

test("POST /temperature/convert - bad request.", async () => {
  const app = createApp();
  const testConvertTemperature = {
    fromUnit: "",
    toUnit: "F",
    value: 25,
  };
  const result = await request(app)
    .post("/temperature/convert")
    .send(testConvertTemperature);

  deepEqual(result.status, 400);
});

test("GET /volume", async () => {
  const app = createApp();
  const result = await request(app).get("/volume");

  const volumeUnits = {
    milliliter: "ml",
    liter: "l",
    cubicCentimeter: "cm3",
    cubicMillimeter: "mm3",
    kiloliter: "kl",
    cubicMeter: "m3",
    cubicKilometer: "km3",
    teaspoon: "tsp",
    tablespoon: "Tbs",
    cubicInch: "in3",
    fluidOunce: "fl-oz",
  };

  deepEqual(result.status, 200);
  deepEqual(result.body, volumeUnits);
});

test("GET /volume/history", async () => {
  const app = createApp();
  const result = await request(app).get("/volume/history");
  deepEqual(result.status, 200);
  deepEqual(result.body.files.length > 0, true);
});

test("GET /volume/history/2024-nov-02", async () => {
  const app = createApp();
  const result = await request(app).get("/volume/history/2024-nov-02");
  deepEqual(result.status, 200);
});

test("POST /volume/convert", async () => {
  const app = createApp();
  const testConvertVolume = {
    fromUnit: "milliliter",
    toUnit: "tablespoon",
    value: "34",
  };
  const result = await request(app)
    .post("/volume/convert")
    .send(testConvertVolume);
  const expectedValue = convertVolume("ml", "Tbs", 34);
  deepEqual(result.status, 200);
  deepEqual(result.body, expectedValue);
});

test("DELETE /volume/history/2024-nov-01", async () => {
  const app = createApp();
  fs.writeFileSync(
    "data/volume-conversions-day/2024-nov-01.json",
    "[]",
    "utf-8",
  );

  const result = await request(app).delete("/volume/history/2024-nov-01");
  deepEqual(result.status, 200);
});
