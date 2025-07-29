import { Module } from '@nestjs/common';
import { SendEmailService } from './send-email.service';
import { SendEmailController } from './send-email.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { SendEmail } from './entities/send-email.entity';
import { NodemailerModule } from 'src/services/nodemailer/nodemailer.module';

@Module({
  imports:[
    TypeOrmModule.forFeature([User, SendEmail]),
    NodemailerModule,
  ],
  exports:[SendEmailService],
  controllers: [SendEmailController],
  providers: [SendEmailService],
})
export class SendEmailModule {}
