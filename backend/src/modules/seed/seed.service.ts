import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../products/product.entity';
import { Category } from '../categories/category.entity';
import { CutOption } from '../cut-options/cut-option.entity';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(CutOption)
    private readonly cutOptionRepo: Repository<CutOption>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async seed() {
    await this.seedCategories();
    await this.seedCutOptions();
    await this.seedProducts();
    console.log('Seed completed successfully!');
  }

  private async seedCategories() {
    const categories = [
      { name: 'Vacuno', description: 'Cortes de carne vacuna' },
      { name: 'Cerdo', description: 'Cortes de cerdo' },
      { name: 'Pollo', description: 'Pollos y piezas' },
      { name: 'Elaborados', description: 'Milanesas y hamburguesas' },
      { name: 'Chacinados', description: 'Embutidos y fiambres' },
      { name: 'Menudencias', description: 'Menudencias y achuras' },
    ];

    for (const cat of categories) {
      const exists = await this.categoryRepo.findOne({ where: { name: cat.name } });
      if (!exists) {
        await this.categoryRepo.save(cat);
      }
    }
  }

  private async seedCutOptions() {
    const options = [
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

    for (const opt of options) {
      const exists = await this.cutOptionRepo.findOne({ where: { name: opt.name } });
      if (!exists) {
        await this.cutOptionRepo.save(opt);
      }
    }
  }

  private async seedProducts() {
    const categories = await this.categoryRepo.find();
    const options = await this.cutOptionRepo.find();

    const categoryByName: Record<string, number> = {};
    for (const c of categories) categoryByName[c.name] = c.id;

    const optionByName: Record<string, CutOption> = {};
    for (const o of options) optionByName[o.name] = o;

    const opt = (name: string) => optionByName[name];
    const cat = (name: string) => categoryByName[name];

    const products = [
      // ========== VACUNO - ASADO Y PARRILLA ==========
      { name: 'Tapa de asado', description: null, basePrice: 22990, unit: 'kg', categoryId: cat('Vacuno'), cutOptions: [opt('Pieza entera'), opt('Trozo')] },
      { name: 'Vacío', description: null, basePrice: 25990, unit: 'kg', categoryId: cat('Vacuno'), cutOptions: [opt('Pieza entera'), opt('Trozo')] },
      { name: 'Matambre', description: null, basePrice: 26990, unit: 'kg', categoryId: cat('Vacuno'), cutOptions: [opt('Pieza entera'), opt('Trozo')] },
      { name: 'Entraña', description: null, basePrice: 26990, unit: 'kg', categoryId: cat('Vacuno'), cutOptions: [opt('Pieza entera')] },
      { name: 'Marucha', description: null, basePrice: 22990, unit: 'kg', categoryId: cat('Vacuno'), cutOptions: [opt('Corte fino'), opt('Corte grueso')] },
      { name: 'Falda', description: null, basePrice: 19990, unit: 'kg', categoryId: cat('Vacuno'), cutOptions: [opt('Corte fino'), opt('Corte grueso')] },
      { name: 'Costilla banderita', description: null, basePrice: 23990, unit: 'kg', categoryId: cat('Vacuno'), cutOptions: [opt('Corte fino'), opt('Corte grueso')] },
      { name: 'Costillar del medio', description: null, basePrice: 25990, unit: 'kg', categoryId: cat('Vacuno'), cutOptions: [opt('Pieza completa')] },
      { name: 'Costillar entero', description: null, basePrice: 22990, unit: 'kg', categoryId: cat('Vacuno'), cutOptions: [opt('Pieza completa')] },
      { name: 'Corte Mar del Plata', description: null, basePrice: 24990, unit: 'kg', categoryId: cat('Vacuno'), cutOptions: [opt('Corte fino'), opt('Corte grueso')] },

      // ========== VACUNO - PULPAS Y CORTES FINOS ==========
      { name: 'Nalga', description: null, basePrice: 28990, unit: 'kg', categoryId: cat('Vacuno'), cutOptions: [opt('Pieza entera'), opt('Trozo'), opt('Bife fino'), opt('Bife grueso'), opt('Cubos'), opt('Tiritas'), opt('Picada')] },
      { name: 'Tapa de nalga', description: null, basePrice: 22990, unit: 'kg', categoryId: cat('Vacuno'), cutOptions: [opt('Pieza entera'), opt('Trozo')] },
      { name: 'Cuadrada', description: null, basePrice: 24990, unit: 'kg', categoryId: cat('Vacuno'), cutOptions: [opt('Pieza entera'), opt('Trozo'), opt('Bife fino'), opt('Bife grueso'), opt('Cubos'), opt('Tiritas'), opt('Picada')] },
      { name: 'Bola de lomo', description: null, basePrice: 24990, unit: 'kg', categoryId: cat('Vacuno'), cutOptions: [opt('Pieza entera'), opt('Trozo'), opt('Bife fino'), opt('Bife grueso'), opt('Cubos'), opt('Tiritas'), opt('Picada')] },
      { name: 'Peceto', description: null, basePrice: 25990, unit: 'kg', categoryId: cat('Vacuno'), cutOptions: [opt('Pieza entera'), opt('Trozo'), opt('Bife fino'), opt('Bife grueso'), opt('Cubos'), opt('Tiritas'), opt('Picada')] },
      { name: 'Cuadril', description: null, basePrice: 24990, unit: 'kg', categoryId: cat('Vacuno'), cutOptions: [opt('Pieza entera'), opt('Trozo'), opt('Bife fino'), opt('Bife grueso'), opt('Cubos'), opt('Tiritas'), opt('Picada')] },
      { name: 'Colita de cuadril', description: null, basePrice: 28990, unit: 'kg', categoryId: cat('Vacuno'), cutOptions: [opt('Pieza entera')] },
      { name: 'Lomo', description: null, basePrice: 29990, unit: 'kg', categoryId: cat('Vacuno'), cutOptions: [opt('Pieza entera'), opt('Trozo'), opt('Bife fino'), opt('Bife grueso'), opt('Cubos'), opt('Tiritas'), opt('Picada')] },
      { name: 'Tortuguita', description: null, basePrice: 22990, unit: 'kg', categoryId: cat('Vacuno'), cutOptions: [opt('Pieza entera'), opt('Trozo'), opt('Bife fino'), opt('Bife grueso'), opt('Cubos'), opt('Tiritas'), opt('Picada')] },
      { name: 'Palomita', description: null, basePrice: 22990, unit: 'kg', categoryId: cat('Vacuno'), cutOptions: [opt('Pieza entera'), opt('Trozo'), opt('Bife fino'), opt('Bife grueso'), opt('Cubos'), opt('Tiritas'), opt('Picada')] },

      // ========== VACUNO - COCINA Y OLLA ==========
      { name: 'Roast Beef', description: null, basePrice: 22990, unit: 'kg', categoryId: cat('Vacuno'), cutOptions: [opt('Trozo'), opt('Churrasco fino'), opt('Churrasco grueso'), opt('Picada')] },
      { name: 'Aguja', description: null, basePrice: 18990, unit: 'kg', categoryId: cat('Vacuno'), cutOptions: [opt('Corte fino'), opt('Corte grueso')] },
      { name: 'Paleta', description: null, basePrice: 22990, unit: 'kg', categoryId: cat('Vacuno'), cutOptions: [opt('Pieza entera'), opt('Trozo'), opt('Churrasco fino'), opt('Churrasco grueso')] },
      { name: 'Osobuco', description: null, basePrice: 14990, unit: 'kg', categoryId: cat('Vacuno'), cutOptions: [opt('Rodaja fina'), opt('Rodaja gruesa')] },

      // ========== VACUNO - BIFES PREMIUM ==========
      { name: 'Ojo de bife', description: null, basePrice: 26990, unit: 'kg', categoryId: cat('Vacuno'), cutOptions: [opt('Churrasco fino'), opt('Churrasco grueso')] },
      { name: 'Bife de chorizo', description: null, basePrice: 26990, unit: 'kg', categoryId: cat('Vacuno'), cutOptions: [opt('Churrasco fino'), opt('Churrasco grueso')] },
      { name: 'Entrecot', description: null, basePrice: 26990, unit: 'kg', categoryId: cat('Vacuno'), cutOptions: [opt('Churrasco fino'), opt('Churrasco grueso')] },

      // ========== VACUNO - COSTELETAS ==========
      { name: 'Costeleta ancha', description: null, basePrice: 20990, unit: 'kg', categoryId: cat('Vacuno'), cutOptions: [opt('Corte fino'), opt('Corte grueso')] },
      { name: 'Costeleta angosta', description: null, basePrice: 20990, unit: 'kg', categoryId: cat('Vacuno'), cutOptions: [opt('Corte fino'), opt('Corte grueso')] },
      { name: 'Costeleta redonda', description: null, basePrice: 21990, unit: 'kg', categoryId: cat('Vacuno'), cutOptions: [opt('Corte fino'), opt('Corte grueso')] },
      { name: 'Carne picada común', description: null, basePrice: 12990, unit: 'kg', categoryId: cat('Vacuno'), cutOptions: [] },

      // ========== CERDO ==========
      { name: 'Solomillo', description: null, basePrice: 16990, unit: 'kg', categoryId: cat('Cerdo'), cutOptions: [opt('Pieza entera'), opt('Trozo')] },
      { name: 'Matambre', description: null, basePrice: 16990, unit: 'kg', categoryId: cat('Cerdo'), cutOptions: [opt('Pieza entera'), opt('Trozo')] },
      { name: 'Churrasco', description: null, basePrice: 16990, unit: 'kg', categoryId: cat('Cerdo'), cutOptions: [opt('Churrasco fino'), opt('Churrasco grueso')] },
      { name: 'Bondiola', description: null, basePrice: 12990, unit: 'kg', categoryId: cat('Cerdo'), cutOptions: [opt('Pieza entera'), opt('Trozo')] },
      { name: 'Marucha', description: null, basePrice: 8990, unit: 'kg', categoryId: cat('Cerdo'), cutOptions: [opt('Corte fino'), opt('Corte grueso')] },
      { name: 'Costilla', description: null, basePrice: 10990, unit: 'kg', categoryId: cat('Cerdo'), cutOptions: [opt('Corte fino'), opt('Corte grueso')] },
      { name: 'Vacío', description: null, basePrice: 11990, unit: 'kg', categoryId: cat('Cerdo'), cutOptions: [opt('Pieza entera'), opt('Trozo')] },
      { name: 'Costeleta', description: null, basePrice: 9990, unit: 'kg', categoryId: cat('Cerdo'), cutOptions: [opt('Corte fino'), opt('Corte grueso')] },
      { name: 'Pulpa', description: null, basePrice: 11990, unit: 'kg', categoryId: cat('Cerdo'), cutOptions: [opt('Pieza entera'), opt('Trozo'), opt('Bife fino'), opt('Bife grueso'), opt('Cubos'), opt('Tiritas'), opt('Picada')] },
      { name: 'Pulpa de paleta', description: null, basePrice: 10990, unit: 'kg', categoryId: cat('Cerdo'), cutOptions: [opt('Pieza entera'), opt('Trozo'), opt('Bife fino'), opt('Bife grueso'), opt('Cubos'), opt('Tiritas'), opt('Picada')] },

      // ========== POLLO ==========
      { name: 'Pollo entero', description: null, basePrice: 6990, unit: 'kg', categoryId: cat('Pollo'), cutOptions: [opt('Entero'), opt('Trozado')] },
      { name: 'Pollo trozado', description: null, basePrice: 6990, unit: 'kg', categoryId: cat('Pollo'), cutOptions: [] },
      { name: 'Cuarto trasero', description: null, basePrice: 5990, unit: 'kg', categoryId: cat('Pollo'), cutOptions: [] },
      { name: 'Pata de pollo', description: null, basePrice: 6990, unit: 'kg', categoryId: cat('Pollo'), cutOptions: [] },
      { name: 'Muslo de pollo', description: null, basePrice: 6990, unit: 'kg', categoryId: cat('Pollo'), cutOptions: [] },
      { name: 'Patamuslo', description: null, basePrice: 6990, unit: 'kg', categoryId: cat('Pollo'), cutOptions: [] },
      { name: 'Alitas', description: null, basePrice: 4990, unit: 'kg', categoryId: cat('Pollo'), cutOptions: [] },
      { name: 'Filet de pechuga', description: null, basePrice: 13990, unit: 'kg', categoryId: cat('Pollo'), cutOptions: [opt('Entero'), opt('Bife fino'), opt('Bife grueso'), opt('Cubos'), opt('Tiritas'), opt('Picado')] },
      { name: 'Filet de muslo', description: null, basePrice: 13990, unit: 'kg', categoryId: cat('Pollo'), cutOptions: [opt('Entero'), opt('Bife fino'), opt('Bife grueso'), opt('Cubos'), opt('Tiritas'), opt('Picado')] },

      // ========== ELABORADOS ==========
      { name: 'Hamburguesas de pollo', description: null, basePrice: 9990, unit: 'kg', categoryId: cat('Elaborados'), cutOptions: [] },
      { name: 'Hamburguesas de carne', description: null, basePrice: 13990, unit: 'kg', categoryId: cat('Elaborados'), cutOptions: [] },
      { name: 'Milanesa de vaca', description: null, basePrice: 19900, unit: 'kg', categoryId: cat('Elaborados'), cutOptions: [opt('Nalga'), opt('Cuadrada'), opt('Bola de lomo'), opt('Cuadril'), opt('Peceto')] },
      { name: 'Milanesa de pollo', description: null, basePrice: 11900, unit: 'kg', categoryId: cat('Elaborados'), cutOptions: [opt('Pechuga'), opt('Muslo')] },
      { name: 'Milanesa de cerdo', description: null, basePrice: 11900, unit: 'kg', categoryId: cat('Elaborados'), cutOptions: [opt('Pulpa'), opt('Bondiola')] },

      // ========== CHACINADOS ==========
      { name: 'Chorizo puro cerdo', description: null, basePrice: 11900, unit: 'kg', categoryId: cat('Chacinados'), cutOptions: [] },
      { name: 'Morcilla casera', description: null, basePrice: 11900, unit: 'kg', categoryId: cat('Chacinados'), cutOptions: [] },
      { name: 'Salamín', description: null, basePrice: 26900, unit: 'kg', categoryId: cat('Chacinados'), cutOptions: [opt('Pieza entera'), opt('Bastón'), opt('Fraccionado por unidad')] },

      // ========== MENUDENCIAS ==========
      { name: 'Mondongo', description: null, basePrice: 12900, unit: 'kg', categoryId: cat('Menudencias'), cutOptions: [] },
      { name: 'Riñón', description: null, basePrice: 12900, unit: 'kg', categoryId: cat('Menudencias'), cutOptions: [] },
      { name: 'Corazón', description: null, basePrice: 12900, unit: 'kg', categoryId: cat('Menudencias'), cutOptions: [] },
      { name: 'Chinchulín', description: null, basePrice: 14900, unit: 'kg', categoryId: cat('Menudencias'), cutOptions: [] },
      { name: 'Tripa gorda', description: null, basePrice: 14900, unit: 'kg', categoryId: cat('Menudencias'), cutOptions: [] },
      { name: 'Molleja', description: null, basePrice: 39900, unit: 'kg', categoryId: cat('Menudencias'), cutOptions: [] },
    ];

    for (const p of products) {
      const exists = await this.productRepo.findOne({ where: { name: p.name } });
      if (!exists) {
        const product = this.productRepo.create({
          name: p.name,
          description: p.description ?? '',
          basePrice: p.basePrice,
          unit: p.unit,
          categoryId: p.categoryId,
          cutOptions: p.cutOptions,
          image: '',
        });
        await this.productRepo.save(product);
      }
    }
  }
}
