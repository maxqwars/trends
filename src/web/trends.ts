import { Router } from "express";
import { ITrends, invContainer } from "../modules";
import { DI_INDX } from "../constants/DI_INDX";

const trendsModule = invContainer.get<ITrends>(DI_INDX.Trends);

const router = Router();

router.get("/trends/:page", async (req, res) => {
  const page = Number(req.params.page) || 1;

  const result = await trendsModule.paginationRead(page, 100);

  console.log(result);

  res.render("trends", result);
});

router.get("/trends/details/:id", async (request, response) => {
  const trendId = Number(request.params.id) || 1;

  const includeKeyword = await trendsModule.getTrendIncludeKeywords(trendId);
  const excludeKeywords = await trendsModule.getTrendExcludeKeywords(trendId);

  response.render("trend_details", {
    includeCount: includeKeyword.length,
    excludeCount: excludeKeywords.length,

    include: includeKeyword.join(` `),
    exclude: excludeKeywords.join(` `)
  });
});

export default router;
