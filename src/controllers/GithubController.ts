import { JsonController, Get, QueryParam, Param, BodyParam, Post } from "routing-controllers";
import { Inject, Service } from "typedi";
import { logInfo } from "@/shared/logger";
import { GithubService } from "@/services/GithubService";
import { RepoDto } from "@/dtos/RepoDto";
import { SimpleResultsDto } from "@/dtos/ResultDto";

@Service()
@JsonController("/github")
export class GithubController {
  constructor(
    @Inject()
    private githubService: GithubService
  ) { }

  @Get("/repos")
  async getRepositories(): Promise<SimpleResultsDto<RepoDto[]>> {
    logInfo(`Fetching all repos`);
    return await this.githubService.getAll();
  }
}
