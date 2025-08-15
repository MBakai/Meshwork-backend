import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Genero } from './entities/genero.entity';
import { Repository } from 'typeorm';

@Injectable()
export class GeneroService {

  constructor(
      @InjectRepository(Genero)
      private readonly generoRepository: Repository<Genero>
  ){}

  async onApplicationBootstrap() {
    const generoPorDefecto = ['Masculino', 'Femenino', 'Otros'];
    
    for (const nombre of generoPorDefecto) {
      const generoExiste = await this.generoRepository.findOneBy( { nombre } );
      if (!generoExiste) {
        
        const nuevo = this.generoRepository.create({ nombre });
        await this.generoRepository.save(nuevo);
      }
    }
  }
}
