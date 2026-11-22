/** Existing public function CORS contract, shared to avoid header drift. */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-lovable-aig-run-id',
  'Access-Control-Expose-Headers': 'X-Lovable-AIG-Run-ID, X-Observatory-Sources',
};