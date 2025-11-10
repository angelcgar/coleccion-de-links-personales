import { initializeTables } from "../app/actions/db-actions";

async function main() {
  console.log("🚀 Iniciando configuración de base de datos...");

  try {
    // Paso 1: Crear tablas
    console.log("📋 Creando tablas...");
    const initResult = await initializeTables();

    if (initResult.success) {
      console.log("✅ Tablas creadas exitosamente");
    } else {
      console.error("❌ Error creando tablas:", initResult.message);
      return;
    }

    // Paso 2: Sembrar datos - COMENTADO
    // console.log("🌱 Sembrando datos iniciales...");
    // const seedResult = await seedInitialData();
    //
    // if (seedResult.success) {
    //   console.log("✅ Datos sembrados exitosamente");
    // } else {
    //   console.error("❌ Error sembrando datos:", seedResult.message);
    //   return;
    // }

    console.log("🎉 ¡Base de datos configurada completamente!");
  } catch (error) {
    console.error("💥 Error durante la configuración:", error);
  }
}

main();
