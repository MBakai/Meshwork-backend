import { MigrationInterface, QueryRunner } from "typeorm";

export class MeshworkTables1755272302788 implements MigrationInterface {
    name = 'MeshworkTables1755272302788'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "genero" ("id" SERIAL NOT NULL, "nombre" text NOT NULL, CONSTRAINT "PK_681c2c8d602304f33f9cc74e6ad" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "roles" ("id" SERIAL NOT NULL, "rolNombre" text NOT NULL, CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "colaborador" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" character varying NOT NULL DEFAULT 'pendiente', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updateAt" TIMESTAMP NOT NULL DEFAULT now(), "solicitanteId" uuid, "destinatarioId" uuid, CONSTRAINT "PK_9b24705cf70371e22e6eb135daa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."notificacione_tipo_enum" AS ENUM('SOLICITUD_ENVIADA', 'SOLICITUD_ACEPTADA', 'SOLICITUD_RECHAZADA', 'TAREA_AVANZADA', 'TAREA_FINALIZADA', 'ASIGNADO', 'DESASIGNADO', 'NONE')`);
        await queryRunner.query(`CREATE TABLE "notificacione" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "titulo" text, "tipo" "public"."notificacione_tipo_enum" NOT NULL DEFAULT 'NONE', "mensaje" character varying NOT NULL, "leida" boolean NOT NULL DEFAULT false, "procesada" boolean DEFAULT false, "data" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "usuarioId" uuid, CONSTRAINT "PK_34e5290ab78df0f8d5ae6852005" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "send_email" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "token" text NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "type" text NOT NULL, "used" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_2802a7112d155706e528d674ec0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nombre" text NOT NULL, "email" text NOT NULL, "password" text NOT NULL, "activo" boolean NOT NULL DEFAULT false, "refresh_token" character varying, "id_genero" integer, "role_id" integer, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "subTask" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "titulo" character varying NOT NULL, "descripcion" character varying, "startDate" date, "endDate" date, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "completedAt" TIMESTAMP, "id_estado" integer, "taskId" uuid, CONSTRAINT "PK_cb0ce90d2bc12a5a3acd6905599" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "estados" ("id" SERIAL NOT NULL, "nombre" character varying NOT NULL, CONSTRAINT "PK_3d9a9f2658d5086012f27924d30" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."task_type_enum" AS ENUM('SIMPLE', 'COMPOSITE')`);
        await queryRunner.query(`CREATE TABLE "task" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "titulo" character varying NOT NULL, "descripcion" character varying NOT NULL, "type" "public"."task_type_enum" NOT NULL DEFAULT 'SIMPLE', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "startDate" date, "endDate" date, "completedAt" TIMESTAMP, "id_estado" integer, "creador_id" uuid, CONSTRAINT "PK_fb213f79ee45060ba925ecd576e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "subtask_asignados" ("subtask_id" uuid NOT NULL, "user_id" uuid NOT NULL, CONSTRAINT "PK_f8810b763e51925309f924262fe" PRIMARY KEY ("subtask_id", "user_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_cba11c72fc3ad3a33759c2b579" ON "subtask_asignados" ("subtask_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_168af9cd097c84e6bf02647108" ON "subtask_asignados" ("user_id") `);
        await queryRunner.query(`ALTER TABLE "colaborador" ADD CONSTRAINT "FK_2e9316834726f73457931ad61de" FOREIGN KEY ("solicitanteId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "colaborador" ADD CONSTRAINT "FK_4cfab558250372e900a3af906c5" FOREIGN KEY ("destinatarioId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notificacione" ADD CONSTRAINT "FK_c184c99634de187777e444d19c3" FOREIGN KEY ("usuarioId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "send_email" ADD CONSTRAINT "FK_f25781de3dfa537ded4689ef053" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_30039e03c926915e148d4391060" FOREIGN KEY ("id_genero") REFERENCES "genero"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_fb2e442d14add3cefbdf33c4561" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "subTask" ADD CONSTRAINT "FK_3433a240877a3f57aacc85f9129" FOREIGN KEY ("id_estado") REFERENCES "estados"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "subTask" ADD CONSTRAINT "FK_0bd6c9ee487a93fc1d6ccad5ef8" FOREIGN KEY ("taskId") REFERENCES "task"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task" ADD CONSTRAINT "FK_a8fde32c66c25242864838ead7e" FOREIGN KEY ("id_estado") REFERENCES "estados"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task" ADD CONSTRAINT "FK_f51f05cc5d47ec120a397b00617" FOREIGN KEY ("creador_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "subtask_asignados" ADD CONSTRAINT "FK_cba11c72fc3ad3a33759c2b579e" FOREIGN KEY ("subtask_id") REFERENCES "subTask"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "subtask_asignados" ADD CONSTRAINT "FK_168af9cd097c84e6bf026471087" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subtask_asignados" DROP CONSTRAINT "FK_168af9cd097c84e6bf026471087"`);
        await queryRunner.query(`ALTER TABLE "subtask_asignados" DROP CONSTRAINT "FK_cba11c72fc3ad3a33759c2b579e"`);
        await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "FK_f51f05cc5d47ec120a397b00617"`);
        await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "FK_a8fde32c66c25242864838ead7e"`);
        await queryRunner.query(`ALTER TABLE "subTask" DROP CONSTRAINT "FK_0bd6c9ee487a93fc1d6ccad5ef8"`);
        await queryRunner.query(`ALTER TABLE "subTask" DROP CONSTRAINT "FK_3433a240877a3f57aacc85f9129"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_fb2e442d14add3cefbdf33c4561"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_30039e03c926915e148d4391060"`);
        await queryRunner.query(`ALTER TABLE "send_email" DROP CONSTRAINT "FK_f25781de3dfa537ded4689ef053"`);
        await queryRunner.query(`ALTER TABLE "notificacione" DROP CONSTRAINT "FK_c184c99634de187777e444d19c3"`);
        await queryRunner.query(`ALTER TABLE "colaborador" DROP CONSTRAINT "FK_4cfab558250372e900a3af906c5"`);
        await queryRunner.query(`ALTER TABLE "colaborador" DROP CONSTRAINT "FK_2e9316834726f73457931ad61de"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_168af9cd097c84e6bf02647108"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cba11c72fc3ad3a33759c2b579"`);
        await queryRunner.query(`DROP TABLE "subtask_asignados"`);
        await queryRunner.query(`DROP TABLE "task"`);
        await queryRunner.query(`DROP TYPE "public"."task_type_enum"`);
        await queryRunner.query(`DROP TABLE "estados"`);
        await queryRunner.query(`DROP TABLE "subTask"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "send_email"`);
        await queryRunner.query(`DROP TABLE "notificacione"`);
        await queryRunner.query(`DROP TYPE "public"."notificacione_tipo_enum"`);
        await queryRunner.query(`DROP TABLE "colaborador"`);
        await queryRunner.query(`DROP TABLE "roles"`);
        await queryRunner.query(`DROP TABLE "genero"`);
    }

}
