import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ShoppingBag, Minus, Plus, Trash2, ExternalLink, Loader2 } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { formatMoney } from '@/lib/shopify';

export function CartDrawer() {
  const [open, setOpen] = useState(false);
  const { items, isLoading, isSyncing, updateQuantity, removeItem, getCheckoutUrl, syncCart } = useCartStore();
  const count = items.reduce((s, i) => s + i.quantity, 0);
  const total = items.reduce((s, i) => s + parseFloat(i.price.amount) * i.quantity, 0);
  useEffect(() => { if (open) syncCart(); }, [open, syncCart]);
  const checkout = () => { const url = getCheckoutUrl(); if (url) { setOpen(false); window.location.assign(url); } };
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative" aria-label={`Cart, ${count} item${count === 1 ? '' : 's'}`}>
          <ShoppingBag className="h-5 w-5" />
          {count > 0 && <span className="absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs text-primary-foreground">{count}</span>}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex h-full w-full flex-col sm:max-w-lg">
        <SheetHeader><SheetTitle>Your cart</SheetTitle><SheetDescription>{count === 0 ? 'Your cart is empty' : `${count} item${count === 1 ? '' : 's'}`}</SheetDescription></SheetHeader>
        <div className="flex min-h-0 flex-1 flex-col pt-6">
          {items.length === 0 ? <div className="flex flex-1 items-center justify-center text-muted-foreground">Nothing here yet.</div> : <>
            <ul className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-2">
              {items.map(item => (
                <li key={item.variantId} className="flex gap-4">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">{item.product.node.images.edges[0]?.node && <img src={item.product.node.images.edges[0].node.url} alt={item.product.node.title} className="h-full w-full object-cover" />}</div>
                  <div className="min-w-0 flex-1"><p className="truncate font-medium">{item.product.node.title}</p><p className="text-sm text-muted-foreground">{item.selectedOptions.map(o => o.value).filter(v => v !== 'Default Title').join(' · ')}</p><p className="font-semibold">{formatMoney(item.price)}</p></div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Remove" onClick={() => removeItem(item.variantId)}><Trash2 className="h-3 w-3" /></Button>
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="icon" className="h-7 w-7" aria-label="Decrease" onClick={() => updateQuantity(item.variantId, item.quantity - 1)}><Minus className="h-3 w-3" /></Button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <Button variant="outline" size="icon" className="h-7 w-7" aria-label="Increase" onClick={() => updateQuantity(item.variantId, item.quantity + 1)}><Plus className="h-3 w-3" /></Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="space-y-4 border-t pt-4">
              <div className="flex justify-between text-lg"><span>Total</span><span className="font-semibold">{formatMoney({ amount: String(total), currencyCode: items[0].price.currencyCode })}</span></div>
              <Button onClick={checkout} className="w-full" size="lg" disabled={isLoading || isSyncing}>{isLoading || isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <><ExternalLink className="mr-2 h-4 w-4" />Checkout</>}</Button>
            </div>
          </>}
        </div>
      </SheetContent>
    </Sheet>
  );
}
