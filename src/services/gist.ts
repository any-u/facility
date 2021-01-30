import { Octokit } from '@octokit/rest';
import { Octokit as OctoKitType } from '@octokit/rest'
import * as https from 'https';
import { OctokitResponse } from '@octokit/types'
import { OctokitOptions } from '@octokit/core/dist-types/types';


export const GISTS_BASE_URL = 'https://api.github.com';

type Response<T> = Promise<OctokitResponse<T>>;

export interface Snippet {
  name: string,
  path: string,
  content: string
}



const DEFAULT_OPTIONS: OctokitOptions = {
  baseUrl: GISTS_BASE_URL
};

export interface GistServiceOptions {
  key?: string
  rejectUnauthorized?: boolean;
  url?: string;
}


class GistsService {
  public static getInstance = (): GistsService =>
    GistsService.instance ? GistsService.instance : new GistsService();

  private static readonly instance?: GistsService;

  private octokit: OctoKitType | null = null
  private options: OctokitOptions = DEFAULT_OPTIONS;

  private constructor() {
    // this.octokit = new Octokit(this.options);
  }

  public configure(options: {
    key?: string;
    rejectUnauthorized?: boolean;
    url?: string;
  }): void {
    const key = options.key || '';
    const url = options.url || 'https://api.github.com';
    const rejectUnauthorized = options.rejectUnauthorized || true;
    const agent = new https.Agent({ rejectUnauthorized });
    const config = { baseUrl: url, agent };
    this.options = config || this.options;
    this.octokit = new Octokit(this.options);
    if (key) {
      this.octokit = new Octokit({ auth: key });
    }
  }

  public create(
    params: any
  ): Response<any> | undefined {
    if (!this.octokit) return
    return this.octokit.gists.create(params);
  }

  public delete(
    params: any
  ): Response<any> | undefined {
    if (!this.octokit) return
    return this.octokit.gists.delete(params);
  }

  public get(
    params: any
  ): any {
    if (!this.octokit) return
    return this.octokit.gists.get({ ...params });
  }

  public list(
    params?: any
  ): Response<any[]> | undefined {
    if (!this.octokit) return
    return this.octokit.gists.list({ ...params });
  }

  public listStarred(
    params?: any
  ): Response<any[]> | undefined {
    if (!this.octokit) return
    return this.octokit.gists.listStarred({ ...params });
  }

  public update(
    params: any
  ): Response<any> | undefined {
    if (!this.octokit) return
    return this.octokit.gists.update(params);
  }
}

export const gists = GistsService.getInstance();