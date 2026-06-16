import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Category } from '../categories/category.entity';
import { CutOption } from '../cut-options/cut-option.entity';
import { Product } from '../products/product.entity';
import { OrderItem } from '../orders/order-item.entity';
import { Order } from '../orders/order.entity';

async function runSeed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: Number(process.env.DATABASE_PORT) || 5432,
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'elsupremo',
    entities: [Category, CutOption, Product, OrderItem, Order],
    synchronize: true,
  });

  await dataSource.initialize();
  const categoryRepo = dataSource.getRepository(Category);
  const cutOptionRepo = dataSource.getRepository(CutOption);
  const productRepo = dataSource.getRepository(Product);

  // ========== CATEGORIES ==========
  const categoriesData = [
    { name: 'Vacuno', description: 'Cortes de carne vacuna' },
    { name: 'Cerdo', description: 'Cortes de cerdo' },
    { name: 'Pollo', description: 'Pollos y piezas' },
    { name: 'Elaborados', description: 'Milanesas y hamburguesas' },
    { name: 'Chacinados', description: 'Embutidos y fiambres' },
    { name: 'Menudencias', description: 'Menudencias y achuras' },
  ];

  const categoryMap: Record<string, Category> = {};
  for (const c of categoriesData) {
    let cat = await categoryRepo.findOne({ where: { name: c.name } });
    if (!cat) cat = await categoryRepo.save(c);
    categoryMap[c.name] = cat;
  }

  // ========== CUT OPTIONS ==========
  const optionsData = [
    { name: 'Pieza entera', description: 'Pieza entera sin procesar', priceModifier: null, requiresNotes: false },
    { name: 'Trozo', description: 'Cortado en trozos', priceModifier: null, requiresNotes: false },
    { name: 'Corte fino', description: 'Corte de espesor fino', priceModifier: null, requiresNotes: false },
    { name: 'Corte grueso', description: 'Corte de espesor grueso', priceModifier: null, requiresNotes: false },
    { name: 'Pieza completa', description: 'La pieza completa tal cual', priceModifier: null, requiresNotes: false },
    { name: 'Bife fino', description: 'Bife de espesor fino', priceModifier: null, requiresNotes: false },
    { name: 'Bife grueso', description: 'Bife de espesor grueso', priceModifier: null, requiresNotes: false },
    { name: 'Cubos', description: 'Cortado en cubos', priceModifier: null, requiresNotes: false },
    { name: 'Tiritas', description: 'Cortado en tiras', priceModifier: null, requiresNotes: false },
    { name: 'Picada', description: 'Carne picada', priceModifier: null, requiresNotes: false },
    { name: 'Churrasco fino', description: 'Churrasco de espesor fino', priceModifier: null, requiresNotes: false },
    { name: 'Churrasco grueso', description: 'Churrasco de espesor grueso', priceModifier: null, requiresNotes: false },
    { name: 'Rodaja fina', description: 'Rodaja de espesor fino', priceModifier: null, requiresNotes: false },
    { name: 'Rodaja gruesa', description: 'Rodaja de espesor grueso', priceModifier: null, requiresNotes: false },
    { name: 'Entero', description: 'Entero sin procesar', priceModifier: null, requiresNotes: false },
    { name: 'Trozado', description: 'Cortado en presas', priceModifier: null, requiresNotes: false },
    { name: 'Picado', description: 'Picado fino', priceModifier: null, requiresNotes: false },
    { name: 'Bastón', description: 'Corte en bastón', priceModifier: null, requiresNotes: false },
    { name: 'Fraccionado por unidad', description: 'Fraccionado por unidad', priceModifier: null, requiresNotes: false },
    { name: 'Nalga', description: 'Milanesa de nalga', priceModifier: null, requiresNotes: false },
    { name: 'Cuadrada', description: 'Milanesa de cuadrada', priceModifier: null, requiresNotes: false },
    { name: 'Bola de lomo', description: 'Milanesa de bola de lomo', priceModifier: null, requiresNotes: false },
    { name: 'Cuadril', description: 'Milanesa de cuadril', priceModifier: null, requiresNotes: false },
    { name: 'Peceto', description: 'Milanesa de peceto', priceModifier: null, requiresNotes: false },
    { name: 'Pechuga', description: 'Milanesa de pechuga de pollo', priceModifier: null, requiresNotes: false },
    { name: 'Muslo', description: 'Milanesa de muslo de pollo', priceModifier: null, requiresNotes: false },
    { name: 'Pulpa', description: 'Milanesa de pulpa de cerdo', priceModifier: null, requiresNotes: false },
    { name: 'Bondiola', description: 'Milanesa de bondiola', priceModifier: null, requiresNotes: false },
  ];

  const optionMap: Record<string, CutOption> = {};
  for (const o of optionsData) {
    let opt = await cutOptionRepo.findOne({ where: { name: o.name } });
    if (!opt) opt = await cutOptionRepo.save(o);
    optionMap[o.name] = opt;
  }

  const opt = (name: string) => optionMap[name];

  // ========== PRODUCTS ==========
  const products = [
    // Vacuno - Asado y Parrilla
    { name: 'Tapa de asado', description: '', basePrice: 22990, unit: 'kg', category: categoryMap['Vacuno'], cutOptions: [opt('Pieza entera'), opt('Trozo')] },
    { name: 'Vacío', description: '', basePrice: 25990, unit: 'kg', category: categoryMap['Vacuno'], cutOptions: [opt('Pieza entera'), opt('Trozo')] },
    { name: 'Matambre', description: '', basePrice: 26990, unit: 'kg', category: categoryMap['Vacuno'], cutOptions: [opt('Pieza entera'), opt('Trozo')] },
    { name: 'Entraña', description: '', basePrice: 26990, unit: 'kg', category: categoryMap['Vacuno'], cutOptions: [opt('Pieza entera')] },
    { name: 'Marucha', description: '', basePrice: 22990, unit: 'kg', category: categoryMap['Vacuno'], cutOptions: [opt('Corte fino'), opt('Corte grueso')] },
    { name: 'Falda', description: '', basePrice: 19990, unit: 'kg', category: categoryMap['Vacuno'], cutOptions: [opt('Corte fino'), opt('Corte grueso')] },
    { name: 'Costilla banderita', description: '', basePrice: 23990, unit: 'kg', category: categoryMap['Vacuno'], cutOptions: [opt('Corte fino'), opt('Corte grueso')] },
    { name: 'Costillar del medio', description: '', basePrice: 25990, unit: 'kg', category: categoryMap['Vacuno'], cutOptions: [opt('Pieza completa')] },
    { name: 'Costillar entero', description: '', basePrice: 22990, unit: 'kg', category: categoryMap['Vacuno'], cutOptions: [opt('Pieza completa')] },
    { name: 'Corte Mar del Plata', description: '', basePrice: 24990, unit: 'kg', category: categoryMap['Vacuno'], cutOptions: [opt('Corte fino'), opt('Corte grueso')] },

    // Vacuno - Pulpas y Cortes Finos
    { name: 'Nalga', description: '', basePrice: 28990, unit: 'kg', category: categoryMap['Vacuno'], cutOptions: [opt('Pieza entera'), opt('Trozo'), opt('Bife fino'), opt('Bife grueso'), opt('Cubos'), opt('Tiritas'), opt('Picada')] },
    { name: 'Tapa de nalga', description: '', basePrice: 22990, unit: 'kg', category: categoryMap['Vacuno'], cutOptions: [opt('Pieza entera'), opt('Trozo')] },
    { name: 'Cuadrada', description: '', basePrice: 24990, unit: 'kg', category: categoryMap['Vacuno'], cutOptions: [opt('Pieza entera'), opt('Trozo'), opt('Bife fino'), opt('Bife grueso'), opt('Cubos'), opt('Tiritas'), opt('Picada')] },
    { name: 'Bola de lomo', description: '', basePrice: 24990, unit: 'kg', category: categoryMap['Vacuno'], cutOptions: [opt('Pieza entera'), opt('Trozo'), opt('Bife fino'), opt('Bife grueso'), opt('Cubos'), opt('Tiritas'), opt('Picada')] },
    { name: 'Peceto', description: '', basePrice: 25990, unit: 'kg', category: categoryMap['Vacuno'], cutOptions: [opt('Pieza entera'), opt('Trozo'), opt('Bife fino'), opt('Bife grueso'), opt('Cubos'), opt('Tiritas'), opt('Picada')] },
    { name: 'Cuadril', description: '', basePrice: 24990, unit: 'kg', category: categoryMap['Vacuno'], cutOptions: [opt('Pieza entera'), opt('Trozo'), opt('Bife fino'), opt('Bife grueso'), opt('Cubos'), opt('Tiritas'), opt('Picada')] },
    { name: 'Colita de cuadril', description: '', basePrice: 28990, unit: 'kg', category: categoryMap['Vacuno'], cutOptions: [opt('Pieza entera')] },
    { name: 'Lomo', description: '', basePrice: 29990, unit: 'kg', category: categoryMap['Vacuno'], cutOptions: [opt('Pieza entera'), opt('Trozo'), opt('Bife fino'), opt('Bife grueso'), opt('Cubos'), opt('Tiritas'), opt('Picada')] },
    { name: 'Tortuguita', description: '', basePrice: 22990, unit: 'kg', category: categoryMap['Vacuno'], cutOptions: [opt('Pieza entera'), opt('Trozo'), opt('Bife fino'), opt('Bife grueso'), opt('Cubos'), opt('Tiritas'), opt('Picada')] },
    { name: 'Palomita', description: '', basePrice: 22990, unit: 'kg', category: categoryMap['Vacuno'], cutOptions: [opt('Pieza entera'), opt('Trozo'), opt('Bife fino'), opt('Bife grueso'), opt('Cubos'), opt('Tiritas'), opt('Picada')] },

    // Vacuno - Cocina y Olla
    { name: 'Roast Beef', description: '', basePrice: 22990, unit: 'kg', category: categoryMap['Vacuno'], cutOptions: [opt('Trozo'), opt('Churrasco fino'), opt('Churrasco grueso'), opt('Picada')] },
    { name: 'Aguja', description: '', basePrice: 18990, unit: 'kg', category: categoryMap['Vacuno'], cutOptions: [opt('Corte fino'), opt('Corte grueso')] },
    { name: 'Paleta', description: '', basePrice: 22990, unit: 'kg', category: categoryMap['Vacuno'], cutOptions: [opt('Pieza entera'), opt('Trozo'), opt('Churrasco fino'), opt('Churrasco grueso')] },
    { name: 'Osobuco', description: '', basePrice: 14990, unit: 'kg', category: categoryMap['Vacuno'], cutOptions: [opt('Rodaja fina'), opt('Rodaja gruesa')] },

    // Vacuno - Bifes Premium
    { name: 'Ojo de bife', description: '', basePrice: 26990, unit: 'kg', category: categoryMap['Vacuno'], cutOptions: [opt('Churrasco fino'), opt('Churrasco grueso')] },
    { name: 'Bife de chorizo', description: '', basePrice: 26990, unit: 'kg', category: categoryMap['Vacuno'], cutOptions: [opt('Churrasco fino'), opt('Churrasco grueso')] },
    { name: 'Entrecot', description: '', basePrice: 26990, unit: 'kg', category: categoryMap['Vacuno'], cutOptions: [opt('Churrasco fino'), opt('Churrasco grueso')] },

    // Vacuno - Costeletas
    { name: 'Costeleta ancha', description: '', basePrice: 20990, unit: 'kg', category: categoryMap['Vacuno'], cutOptions: [opt('Corte fino'), opt('Corte grueso')] },
    { name: 'Costeleta angosta', description: '', basePrice: 20990, unit: 'kg', category: categoryMap['Vacuno'], cutOptions: [opt('Corte fino'), opt('Corte grueso')] },
    { name: 'Costeleta redonda', description: '', basePrice: 21990, unit: 'kg', category: categoryMap['Vacuno'], cutOptions: [opt('Corte fino'), opt('Corte grueso')] },
    { name: 'Carne picada común', description: '', basePrice: 12990, unit: 'kg', category: categoryMap['Vacuno'], cutOptions: [] },

    // Cerdo
    { name: 'Solomillo', description: '', basePrice: 16990, unit: 'kg', category: categoryMap['Cerdo'], cutOptions: [opt('Pieza entera'), opt('Trozo')] },
    { name: 'Matambre', description: '', basePrice: 16990, unit: 'kg', category: categoryMap['Cerdo'], cutOptions: [opt('Pieza entera'), opt('Trozo')] },
    { name: 'Churrasco', description: '', basePrice: 16990, unit: 'kg', category: categoryMap['Cerdo'], cutOptions: [opt('Churrasco fino'), opt('Churrasco grueso')] },
    { name: 'Bondiola', description: '', basePrice: 12990, unit: 'kg', category: categoryMap['Cerdo'], cutOptions: [opt('Pieza entera'), opt('Trozo')] },
    { name: 'Marucha', description: '', basePrice: 8990, unit: 'kg', category: categoryMap['Cerdo'], cutOptions: [opt('Corte fino'), opt('Corte grueso')] },
    { name: 'Costilla', description: '', basePrice: 10990, unit: 'kg', category: categoryMap['Cerdo'], cutOptions: [opt('Corte fino'), opt('Corte grueso')] },
    { name: 'Vacío', description: '', basePrice: 11990, unit: 'kg', category: categoryMap['Cerdo'], cutOptions: [opt('Pieza entera'), opt('Trozo')] },
    { name: 'Costeleta', description: '', basePrice: 9990, unit: 'kg', category: categoryMap['Cerdo'], cutOptions: [opt('Corte fino'), opt('Corte grueso')] },
    { name: 'Pulpa', description: '', basePrice: 11990, unit: 'kg', category: categoryMap['Cerdo'], cutOptions: [opt('Pieza entera'), opt('Trozo'), opt('Bife fino'), opt('Bife grueso'), opt('Cubos'), opt('Tiritas'), opt('Picada')] },
    { name: 'Pulpa de paleta', description: '', basePrice: 10990, unit: 'kg', category: categoryMap['Cerdo'], cutOptions: [opt('Pieza entera'), opt('Trozo'), opt('Bife fino'), opt('Bife grueso'), opt('Cubos'), opt('Tiritas'), opt('Picada')] },

    // Pollo
    { name: 'Pollo entero', description: '', basePrice: 6990, unit: 'kg', category: categoryMap['Pollo'], cutOptions: [opt('Entero'), opt('Trozado')] },
    { name: 'Pollo trozado', description: '', basePrice: 6990, unit: 'kg', category: categoryMap['Pollo'], cutOptions: [] },
    { name: 'Cuarto trasero', description: '', basePrice: 5990, unit: 'kg', category: categoryMap['Pollo'], cutOptions: [] },
    { name: 'Pata de pollo', description: '', basePrice: 6990, unit: 'kg', category: categoryMap['Pollo'], cutOptions: [] },
    { name: 'Muslo de pollo', description: '', basePrice: 6990, unit: 'kg', category: categoryMap['Pollo'], cutOptions: [] },
    { name: 'Patamuslo', description: '', basePrice: 6990, unit: 'kg', category: categoryMap['Pollo'], cutOptions: [] },
    { name: 'Alitas', description: '', basePrice: 4990, unit: 'kg', category: categoryMap['Pollo'], cutOptions: [] },
    { name: 'Filet de pechuga', description: '', basePrice: 13990, unit: 'kg', category: categoryMap['Pollo'], cutOptions: [opt('Entero'), opt('Bife fino'), opt('Bife grueso'), opt('Cubos'), opt('Tiritas'), opt('Picado')] },
    { name: 'Filet de muslo', description: '', basePrice: 13990, unit: 'kg', category: categoryMap['Pollo'], cutOptions: [opt('Entero'), opt('Bife fino'), opt('Bife grueso'), opt('Cubos'), opt('Tiritas'), opt('Picado')] },

    // Elaborados
    { name: 'Hamburguesas de pollo', description: '', basePrice: 9990, unit: 'kg', category: categoryMap['Elaborados'], cutOptions: [] },
    { name: 'Hamburguesas de carne', description: '', basePrice: 13990, unit: 'kg', category: categoryMap['Elaborados'], cutOptions: [] },
    { name: 'Milanesa de vaca', description: '', basePrice: 19900, unit: 'kg', category: categoryMap['Elaborados'], cutOptions: [opt('Nalga'), opt('Cuadrada'), opt('Bola de lomo'), opt('Cuadril'), opt('Peceto')] },
    { name: 'Milanesa de pollo', description: '', basePrice: 11900, unit: 'kg', category: categoryMap['Elaborados'], cutOptions: [opt('Pechuga'), opt('Muslo')] },
    { name: 'Milanesa de cerdo', description: '', basePrice: 11900, unit: 'kg', category: categoryMap['Elaborados'], cutOptions: [opt('Pulpa'), opt('Bondiola')] },

    // Chacinados
    { name: 'Chorizo puro cerdo', description: '', basePrice: 11900, unit: 'kg', category: categoryMap['Chacinados'], cutOptions: [] },
    { name: 'Morcilla casera', description: '', basePrice: 11900, unit: 'kg', category: categoryMap['Chacinados'], cutOptions: [] },
    { name: 'Salamín', description: '', basePrice: 26900, unit: 'kg', category: categoryMap['Chacinados'], cutOptions: [opt('Pieza entera'), opt('Bastón'), opt('Fraccionado por unidad')] },

    // Menudencias
    { name: 'Mondongo', description: '', basePrice: 12900, unit: 'kg', category: categoryMap['Menudencias'], cutOptions: [] },
    { name: 'Riñón', description: '', basePrice: 12900, unit: 'kg', category: categoryMap['Menudencias'], cutOptions: [] },
    { name: 'Corazón', description: '', basePrice: 12900, unit: 'kg', category: categoryMap['Menudencias'], cutOptions: [] },
    { name: 'Chinchulín', description: '', basePrice: 14900, unit: 'kg', category: categoryMap['Menudencias'], cutOptions: [] },
    { name: 'Tripa gorda', description: '', basePrice: 14900, unit: 'kg', category: categoryMap['Menudencias'], cutOptions: [] },
    { name: 'Molleja', description: '', basePrice: 39900, unit: 'kg', category: categoryMap['Menudencias'], cutOptions: [] },
  ];

  for (const p of products) {
    const exists = await productRepo.findOne({ where: { name: p.name } });
    if (!exists) {
      await productRepo.save(p);
    }
  }

  console.log('Seed completed!');
  await dataSource.destroy();
}

runSeed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
