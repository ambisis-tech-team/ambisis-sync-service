import { env } from "../../infra/env/env";
import { ServiceIntegrator } from "ambisis_node_helper";

export async function sendEmailError(service: string, message: string) {
  const baseUrl = env.PRIVATE_SERVICE_URL;
  const fetchData = await new ServiceIntegrator({
    privateKey: env.PRIVATE_SERVICE_PRIVATE_KEY,
    serviceHost: baseUrl,
  }).post("/mail/error_admin_report", { service, message });
  const getData = await fetchData.json();
  return {
    data: getData.data,
    code: fetchData.status,
    message: getData.message,
  };
}
