const productos = [
  {
    "id": 1,
    "nombre": "AMD Ryzen 5 5600X",
    "categoria": "procesador",
    "precio": 230000,
    "imagen": "https://imagenes.compragamer.com/productos/compragamer_Imganen_general_22384_Procesador_AMD_Ryzen_5_5600X_4.6GHz_Turbo_AM4_-_No_incluye_Cooler_cb33e49e-grn.jpg",
    "specs": { "socket": "AM4", "graficos": false, "consumo_watts": 65 }
  },
  {
    "id": 2,
    "nombre": "AMD Ryzen 7 7800X3D",
    "categoria": "procesador",
    "precio": 650000,
    "imagen": "https://imagenes.compragamer.com/productos/compragamer_Imganen_general_36162_Procesador_AMD_Ryzen_7_7800X3D_5.0GHz_Turbo_AM5_-_No_Includes_Cooler_-_C_Video_e0c1f5d6-grn.jpg",
    "specs": { "socket": "AM5", "graficos": true, "consumo_watts": 120 }
  },
  {
    "id": 3,
    "nombre": "Intel Core i5 12400F",
    "categoria": "procesador",
    "precio": 190000,
    "imagen": "https://imagenes.compragamer.com/productos/compragamer_Imganen_general_31362_Procesador_Intel_Core_i5_12400F_4.4GHz_Turbo_Socket_1700_Alder_Lake_0d82662a-grn.jpg",
    "specs": { "socket": "LGA1700", "graficos": false, "consumo_watts": 65 }
  },
  {
    "id": 4,
    "nombre": "ASUS ROG STRIX B550-F GAMING",
    "categoria": "placa_base",
    "precio": 210000,
    "imagen": "https://imagenes.compragamer.com/productos/compragamer_Imganen_general_20560_Mother_ASUS_ROG_STRIX_B550-F_GAMING_WI-FI_II_AM4_f2025170-grn.jpg",
    "specs": { "socket": "AM4", "tipo_memoria": "DDR4", "formato": "ATX" }
  },
  {
    "id": 5,
    "nombre": "MSI B650 TOMAHAWK WIFI",
    "categoria": "placa_base",
    "precio": 320000,
    "imagen": "https://imagenes.compragamer.com/productos/compragamer_Imganen_general_35649_Mother_MSI_MAG_B650_TOMAHAWK_WIFI_AM5_76135832-grn.jpg",
    "specs": { "socket": "AM5", "tipo_memoria": "DDR5", "formato": "ATX" }
  },
  {
    "id": 6,
    "nombre": "Gigabyte B760M DS3H",
    "categoria": "placa_base",
    "precio": 185000,
    "imagen": "https://imagenes.compragamer.com/productos/compragamer_Imganen_general_35719_Mother_Gigabyte_B760M_DS3H_AX_DDR4_S1700_edb79998-grn.jpg",
    "specs": { "socket": "LGA1700", "tipo_memoria": "DDR4", "formato": "mATX" }
  },
  {
    "id": 7,
    "nombre": "Corsair Vengeance LPX 16GB (2x8GB) 3200MHz",
    "categoria": "memoria_ram",
    "precio": 65000,
    "imagen": "https://imagenes.compragamer.com/productos/compragamer_Imganen_general_11246_Memoria_Corsair_DDR4_16GB__2x8GB__3200MHz_Vengeance_LPX_Black_f0709403-grn.jpg",
    "specs": { "tipo": "DDR4", "capacidad_gb": 16, "velocidad_mhz": 3200 }
  },
  {
    "id": 8,
    "nombre": "Kingston Fury Beast 32GB (2x16GB) 6000MHz",
    "categoria": "memoria_ram",
    "precio": 140000,
    "imagen": "https://imagenes.compragamer.com/productos/compragamer_Imganen_general_36551_Memoria_Kingston_DDR5_32GB__2x16GB__6000MHz_Fury_Beast_Black_EXPO_b5774a38-grn.jpg",
    "specs": { "tipo": "DDR5", "capacidad_gb": 32, "velocidad_mhz": 6000 }
  },
  {
    "id": 9,
    "nombre": "ASUS Dual GeForce RTX 4060 8GB",
    "categoria": "tarjeta_grafica",
    "precio": 450000,
    "imagen": "https://imagenes.compragamer.com/productos/compragamer_Imganen_general_36465_Placa_de_Video_ASUS_Dual_GeForce_RTX_4060_OC_8GB_GDDR6_White_cb1d5e3c-grn.jpg",
    "specs": { "marca": "NVIDIA", "vram_gb": 8 }
  },
  {
    "id": 10,
    "nombre": "XFX Radeon RX 7800 XT 16GB",
    "categoria": "tarjeta_grafica",
    "precio": 780000,
    "imagen": "https://imagenes.compragamer.com/productos/compragamer_Imganen_general_37330_Placa_de_Video_XFX_Radeon_RX_7800_XT_16GB_GDDR6_Speedster_QICK_319_Core_Edition_a7c66708-grn.jpg",
    "specs": { "marca": "AMD", "vram_gb": 16 }
  }
];