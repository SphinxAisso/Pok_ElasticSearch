import {Component, ElementRef, OnInit, ViewChild, ChangeDetectorRef} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Title} from '@angular/platform-browser';
import {environment} from '../../environments/environment';
import {SearchService} from './search.service';
import {FormControl} from '@angular/forms';
import {valid} from 'semver';

@Component({
    templateUrl: './search.component.html',
    providers: [SearchService],
    styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
    timerElasticComp: string;
    timerAS400Comp: string;
    public searchControl: FormControl;
    responseElastic: object[];
    responseAS400: object[];
    elastic_params: string;
    as400_params: string;
    loadingElastic: boolean;
    loadingAS400: boolean;
    errorAS400: any;
    errorElastic: any;
    headers: string[];
    @ViewChild('search')
    public searchElementRef: ElementRef;
    public address: string;
    env = environment;


    constructor(
        private searchService: SearchService,
        private route: ActivatedRoute,
        private router: Router,
        private cdr: ChangeDetectorRef,
        private titleService: Title
    ) {
        this.loadingElastic = false;
        this.loadingAS400 = false;
        this.env.isLoggedIn = true;
        this.env.goBack = false;
        document.body.className = 'page page-home page-contact';
        this.responseElastic = null;
        this.responseAS400 = null;
    }

    ngOnInit() {
        this.titleService.setTitle('POC ElasticSearch');
        //create search FormControl
        this.searchControl = new FormControl();
    }

    clear() {
        this.headers = undefined;
    }

    msToTime(duration) {
        const milliseconds = (parseInt(duration) % 1000);
        let seconds = Math.trunc(parseInt(duration) / 1000) % 60 + '';
        let minutes = Math.trunc(parseInt(duration) / (1000 * 60)) % 60 + '';

        minutes = (parseInt(minutes) < 10) ? '0' + minutes : minutes;
        seconds = (parseInt(seconds) < 10) ? '0' + seconds : seconds;

        return minutes + ' min ' + seconds + ' sec ' + milliseconds + ' ms';
    }

    showSearchResponseElastic() {
        const req = this.searchService.encodeQueryData(this.elastic_params);
        this.searchService.generate_id(req).subscribe(resp => {
            const regex2 = /[^id_agent=].*&/gi;
            const valide = req.query.replace(regex2, `${resp.id}&`);
            const start = Date.now();
            this.searchService.getElasticResponse(valide)
                .subscribe(
                    res => {
                        this.responseElastic = [];
                        this.timerElasticComp = this.msToTime(Date.now() - start) + '';
                        res.body._resource.map(item => {
                            const object = {
                                num_dossier: item.id_dossier,
                                origine: item.origine,
                                personne: item.id_personne,
                                statut: item.statut.libelle,
                                type: item.type_dossier
                            };
                            this.responseElastic.push(object);
                        });
                    },
                    error => {
                        console.log('ERROR! ' + error);
                        this.errorElastic = error;
                        this.loadingElastic = false;
                    },
                    () => {
                        this.loadingElastic = false;
                        console.log('showSearchResponseElastic - Finished!');
                    });
        });

    }

    showSearchResponseAS400() {
        const req = this.searchService.encodeQueryData(this.as400_params);
        this.searchService.generate_id(req).subscribe(resp => {
            const regex2 = /[^id_agent=].*&/gi;
            const valide = req.query.replace(regex2, `${resp.id}&`);
            const start = Date.now();
            this.searchService.getAS400Response(valide)
                .subscribe(
                    res => {
                        this.responseAS400 = [];
                        this.timerAS400Comp = this.msToTime(Date.now() - start) + '';
                        res.body._resource.map(item => {
                            const object = {
                                num_dossier: item.id_dossier,
                                origine: item.origine,
                                personne: item.id_personne,
                                statut: item.statut.libelle,
                                type: item.type_dossier
                            };
                            this.responseAS400.push(object);
                        });
                    },
                    error => {
                        console.log('ERROR! ' + error);
                        this.errorAS400 = error;
                        this.loadingAS400 = false;
                    },
                    () => {
                        this.loadingAS400 = false;
                        console.log('showSearchResponseAS400 - Finished!');
                    });
        });
    }

    public onSubmitElastic() {
        this.errorElastic = undefined;
        this.responseElastic = null;
        this.loadingElastic = true;
        this.showSearchResponseElastic();
        this.cdr.detectChanges();
    }

    public onSubmitAS400() {
        this.errorAS400 = undefined;
        this.responseAS400 = null;
        this.loadingAS400 = true;
        this.showSearchResponseAS400();
        this.cdr.detectChanges();
    }
}