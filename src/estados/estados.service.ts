import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { Estados } from './entities/estados.entity';

@Injectable()
export class EstadosService {

  constructor(
    @InjectRepository(Estados)
    private readonly estadoRepository: Repository<Estados>,
  ){}


  async onApplicationBootstrap(){
    const estadoPorDefecto = ['Creado', 'Empezado', 'En-proceso', 'Terminado'];

    for( const nombre of estadoPorDefecto ){
      const estadoExiste = await this.estadoRepository.findOneBy( { nombre } )
      if( !estadoExiste ){
        const nuevo = this.estadoRepository.create( {nombre} );
        await this.estadoRepository.save( nuevo );
      }
    }
  }

  async getAllEstado(){
    return this.estadoRepository.find({
      order: {
        id: 'ASC' 
      }
    });
  }

}
