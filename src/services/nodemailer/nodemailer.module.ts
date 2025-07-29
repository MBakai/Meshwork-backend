import { Module } from '@nestjs/common';
import { NodemailerService } from './nodemailer.service';
import { TemplateModule } from '../template/template.module';

@Module({
  imports:[TemplateModule],
  providers: [NodemailerService],
  exports:[NodemailerService]
})
export class NodemailerModule {}
