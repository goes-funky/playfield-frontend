import { HttpClient } from '@angular/common/http';
import { Component, Injectable, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

// https://y42.com/dashboard/api/dashboards
// https://y42.com/dashboard/api/dashboards/{id: string}

export type ID = string | number;

export interface ObjectWithID {
  id: ID;
}

export type UrlParams = Record<string, string | number>;
export type GetAllUrlParams = UrlParams;
export type GetOneUrlParams = UrlParams & ObjectWithID;

export interface Dashboard extends ObjectWithID {
  id: string;
  widgets: DashboardWidget[];
}

// https://y42.com/dashboard/api/dashboards/{id: string}/widgets
// https://y42.com/dashboard/api/dashboards/{id: string}/widgets/{id: string}

export interface DashboardWidget extends ObjectWithID {
  id: string;
}

export type DashboardWidgetUrlParam = 'dashboardId';
export type DashboardWidgetUrlParams<T> = Record<DashboardWidgetUrlParam, T[keyof T]>;

// export type DashboardWigetUrlParams = UrlParams &
// https://y42.com/datasource/api/datasources
// https://y42.com/datasource/api/datasources/{id: number}

interface Datasource extends ObjectWithID {
  id: number;
  tables: DatasourceTable[];
}

// https://y42.com/datasource/api/datasources/{id: number}/tables
// https://y42.com/datasource/api/datasources/{id: number}/tables/{id: number}

export interface DatasourceTable extends ObjectWithID {
  id: number;
}

export type DatasourceTableUrlParam = 'datasourceId';
export type DatasourceTableUrlParams<T> = Record<DatasourceTableUrlParam, T[keyof T]>;

@Injectable({
  providedIn: 'root',
})
export abstract class BaseService<T extends ObjectWithID, P extends UrlParams> {
  constructor(private http: HttpClient) {}

  abstract readonly finalUrl: string;

  getAllEntries(params?: P) {
    const url = this.buildUrl(params);

    console.log(`Fetching from ${url}`);
    return this.http.get<T[]>(url);
  }

  getEntryById(id: T['id'], params?: P) {
    const url = `${this.buildUrl(params)}/${id}`;

    console.log(`Fetching from ${url}`);
    return this.http.get<T>(`${url}/${id}`);
  }

  private buildUrl(params?: P) {
    return params
      ? Object.entries(params).reduce(
          (finalUrl, [key, value]) => finalUrl.replace(`{${key}}`, `${value}`),
          this.finalUrl
        )
      : this.finalUrl;
  }
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService extends BaseService<Dashboard, never> {
  constructor(http: HttpClient) {
    super(http);
  }

  readonly finalUrl = '/dashboard/api/dashboards';
}

@Injectable({
  providedIn: 'root',
})
export class DashboardWidgetService extends BaseService<
  DashboardWidget,
  DashboardWidgetUrlParams<DashboardWidget>
> {
  constructor(http: HttpClient) {
    super(http);
  }

  readonly finalUrl = '/dashboard/api/dashboards/{dashboardId}/widgets';
}

@Injectable({
  providedIn: 'root',
})
export class DatasourceService extends BaseService<Datasource, never> {
  constructor(http: HttpClient) {
    super(http);
  }

  readonly finalUrl = '/datasource/api/datasources';
}

@Injectable({
  providedIn: 'root',
})
export class DatasourceTableService extends BaseService<
  DatasourceTable,
  DatasourceTableUrlParams<DatasourceTable>
> {
  constructor(http: HttpClient) {
    super(http);
  }

  readonly finalUrl = '/datasource/api/datasources/{datasourceId}/tables';
}

@Component({
  selector: 'app-url-text',
  template: ``,
})
export class UrlTestComponent implements OnInit {
  constructor(
    private dashboardService: DashboardService,
    private dashboardWidgetService: DashboardWidgetService,
    private datasourceService: DatasourceService,
    private datasourceTableService: DatasourceTableService
  ) {}

  ngOnInit(): void {
    this.getAllDashoards().subscribe();
    this.getDashboardById('1').subscribe();

    this.getAllDashobardWidgets('1').subscribe();
    this.getDashboardWidgetById('1', '1').subscribe();

    this.getAllDatasources().subscribe();
    this.getDatasourcesById(1).subscribe();

    this.getAllDatasourceTables(1).subscribe();
    this.getDatasourceTableById(1, 1).subscribe();
  }

  getAllDashoards(): Observable<Dashboard[]> {
    return this.dashboardService.getAllEntries();
  }

  getDashboardById(id: Dashboard['id']): Observable<Dashboard> {
    return this.dashboardService.getEntryById(id);
  }

  getAllDashobardWidgets(dashboardId: Dashboard['id']): Observable<DashboardWidget[]> {
    return this.dashboardWidgetService.getAllEntries({ dashboardId });
  }

  getDashboardWidgetById(id: DashboardWidget['id'], dashboardId: Dashboard['id']) {
    return this.dashboardWidgetService.getEntryById(id, { dashboardId });
  }

  getAllDatasources(): Observable<Datasource[]> {
    return this.datasourceService.getAllEntries();
  }

  getDatasourcesById(id: Datasource['id']): Observable<Datasource> {
    return this.datasourceService.getEntryById(id);
  }

  getAllDatasourceTables(datasourceId: Datasource['id']): Observable<DatasourceTable[]> {
    return this.datasourceTableService.getAllEntries({ datasourceId });
  }

  getDatasourceTableById(
    id: DatasourceTable['id'],
    datasourceId: Datasource['id']
  ): Observable<DatasourceTable> {
    return this.datasourceTableService.getEntryById(id, { datasourceId });
  }
}
