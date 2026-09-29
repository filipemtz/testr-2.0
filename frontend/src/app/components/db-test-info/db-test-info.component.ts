import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import { ActivatedRoute, RouterModule } from '@angular/router';
import { DbTestInfo } from '../../models/db_test_info';
import { DbTestInfoService as DbTestInfoService } from '../../services/db-test-info.service';
import Notify from 'simple-notify';
import { FormsModule, Validators } from '@angular/forms';

import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-db-test-info',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
    templateUrl: './db-test-info.component.html',
    styleUrl: './db-test-info.component.css'
})
export class DbTestInfoComponent {
    questionId: number = -1;
    relaxTestInfoId: number = -1;
    notification: any;
    form = this.form_builder.nonNullable.group({
        database: ['', Validators.required],
        correct_query: ['', Validators.required]
    });
    infoExists: boolean = false;

    available_databases: string[] = [];

    @Input()
    databases: string[] = [];

    constructor(
        private route: ActivatedRoute,
        private dbTestService: DbTestInfoService,
        private form_builder: FormBuilder
    ) { }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('questionId');

        if (id !== null) {
            this.questionId = +id;
            this.dbTestService.get(this.questionId).subscribe({
                next: (data: any) => {
                    this.form.patchValue(data);
                    this.infoExists = true;
                    this.relaxTestInfoId = data['id'];
                },
                error(err) { }  // creating the information now
            })
        }

        this._read_available_databases();
    }

    save(): void {
        if (this.form.valid) {
            let data: DbTestInfo = {
                ...new DbTestInfo(),
                ...this.form.getRawValue(),
                question: this.questionId
            };

            if (!this.infoExists)
                this._create_new(data);
            else {
                data.id = this.relaxTestInfoId;
                this._edit(data);
            }
        }

        this.form.markAllAsTouched();
    }

    _create_new(data: DbTestInfo): void {
        this.dbTestService.post(data).subscribe({
            next: (data: any) => {
                console.log("resultado:" + data);
                this.form.patchValue(data);
                this.infoExists = true;
                this.relaxTestInfoId = data['id'];
                this.notification = new Notify({
                    status: "success",
                    title: "OK",
                    text: "Informações de correção atualizadas com sucesso.",
                    effect: 'slide',
                    type: 'filled',
                });
            },
            error: (err) => {
                this.notification = new Notify({
                    status: "error",
                    title: "Error!",
                    text: "Falha ao salvar configuração dos testes.",
                    effect: 'slide',
                    type: 'filled',
                });
            },
        });
    }

    _read_available_databases(): void {
        this.dbTestService.databases().subscribe(databases => this.available_databases = databases);
    }

    _edit(data: DbTestInfo): void {
        console.log("edit: " + JSON.stringify(data));
        this.dbTestService.edit(data).subscribe({
            next: (data: any) => {
                console.log("resultado:" + data);
                this.form.patchValue(data);
                this.infoExists = true;
                this.relaxTestInfoId = data['id'];
                this.notification = new Notify({
                    status: "success",
                    title: "OK",
                    text: "Informações de teste atualizadas.",
                    effect: 'slide',
                    type: 'filled',
                });
            },
            error: (err) => {
                this.notification = new Notify({
                    status: "error",
                    title: "Error!",
                    text: "Falha ao salvar configuração dos testes.",
                    effect: 'slide',
                    type: 'filled',
                });
            },
        });
    }
}
