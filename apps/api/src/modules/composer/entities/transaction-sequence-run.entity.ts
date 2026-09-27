import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('transaction_sequence_run')
export class TransactionSequenceRun {
  @Column({ name: 'user_id', nullable: true })
  userId: string | null;
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  network: string;

  @Column({ name: 'stop_on_failure' })
  stopOnFailure: boolean;

  @Column()
  status: string;

  @Column({ type: 'jsonb' })
  steps: Record<string, unknown>[];

  @Column({ type: 'jsonb', nullable: true })
  results: Record<string, unknown>[] | null;

  @Column({ type: 'text', nullable: true })
  error: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
