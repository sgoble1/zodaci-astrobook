CREATE OR REPLACE FUNCTION public.apply_shopify_order(_order jsonb,_allowed text[])
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE sid uuid; linked_owner uuid;
BEGIN
 IF jsonb_typeof(_order)<>'object' OR coalesce(_order->>'shop','')<>'zodaci-astrobook-e3648-srr1g6qe.myshopify.com' OR coalesce(_order->>'shopify_order_id','')!~ '^gid://shopify/Order/[0-9]+$' OR jsonb_typeof(_order->'line_items')<>'array' THEN RAISE EXCEPTION 'Invalid order snapshot'; END IF;
 linked_owner=(_order->>'owner_id')::uuid;
 INSERT INTO public.shopify_order_sync(shop,shopify_order_id,financial_status,fulfillment_status,canceled,refunded,test,owner_id,line_items,tracking,provider_updated_at,updated_at)
 VALUES(_order->>'shop',_order->>'shopify_order_id',_order->>'financial_status',_order->>'fulfillment_status',(_order->>'canceled')::boolean,(_order->>'refunded')::boolean,(_order->>'test')::boolean,linked_owner,_order->'line_items',_order->'tracking',(_order->>'provider_updated_at')::timestamptz,now())
 ON CONFLICT(shop,shopify_order_id) DO UPDATE SET financial_status=EXCLUDED.financial_status,fulfillment_status=EXCLUDED.fulfillment_status,canceled=shopify_order_sync.canceled OR EXCLUDED.canceled,refunded=shopify_order_sync.refunded OR EXCLUDED.refunded,test=EXCLUDED.test,owner_id=EXCLUDED.owner_id,line_items=EXCLUDED.line_items,tracking=EXCLUDED.tracking,provider_updated_at=EXCLUDED.provider_updated_at,updated_at=now()
 WHERE EXCLUDED.provider_updated_at>=shopify_order_sync.provider_updated_at
 RETURNING id INTO sid;
 IF sid IS NULL THEN RETURN NULL; END IF;
 UPDATE public.shopify_digital_access SET revoked_at=now() WHERE order_sync_id=sid;
 INSERT INTO public.shopify_digital_access(order_sync_id,line_id,owner_id,revoked_at)
 SELECT sid,l->>'id',o.owner_id,NULL FROM public.shopify_order_sync o CROSS JOIN LATERAL jsonb_array_elements(o.line_items) l
 WHERE o.id=sid AND o.owner_id IS NOT NULL AND o.financial_status='PAID' AND NOT o.canceled AND NOT o.refunded AND NOT o.test AND l->>'variantId'=ANY(_allowed)
 ON CONFLICT(order_sync_id,line_id) DO UPDATE SET owner_id=EXCLUDED.owner_id,revoked_at=NULL;
 RETURN sid;
END $$;
REVOKE ALL ON FUNCTION public.apply_shopify_order(jsonb,text[]) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.apply_shopify_order(jsonb,text[]) TO service_role;