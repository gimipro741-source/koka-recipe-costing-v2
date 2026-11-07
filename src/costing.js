export const units = {
  'كجم': { dimension: 'mass', factor: 1000 },
  'جرام': { dimension: 'mass', factor: 1 },
  'لتر': { dimension: 'volume', factor: 1000 },
  'مل': { dimension: 'volume', factor: 1 },
  'قطعة': { dimension: 'count', factor: 1 },
};

export function compatibleUnits(unit) {
  return Object.keys(units).filter(key => units[key].dimension === units[unit]?.dimension);
}

function convert(quantity, from, to, name) {
  if (!units[from] || !units[to] || units[from].dimension !== units[to].dimension) {
    throw new Error('وحدة القياس غير متوافقة مع المكوّن «' + name + '».');
  }
  return quantity * units[from].factor / units[to].factor;
}

export function unitCost(material, unit) {
  return material.price / convert(material.packQty ?? 1, material.unit, unit, material.name);
}

export function calculateCosts(materials, recipes) {
  const materialsById = new Map(materials.map(item => [item.id, item]));
  const recipesById = new Map(recipes.map(item => [item.id, item]));
  const costs = new Map();
  const visiting = new Set();

  function breakdown(recipe) {
    if (costs.has(recipe.id)) return costs.get(recipe.id);
    if (visiting.has(recipe.id)) {
      throw new Error('هناك اعتماد دائري عبر «' + recipe.name + '». اختر مكوّناً لا يعتمد على هذه الوصفة.');
    }
    visiting.add(recipe.id);
    try {
      const ingredients = recipe.lines.reduce((sum, line) => {
        const material = materialsById.get(line.id);
        if (material) return sum + line.qty * unitCost(material, line.unit ?? material.unit);
        const component = recipesById.get(line.id);
        if (!component) throw new Error('يوجد مكوّن غير موجود في «' + recipe.name + '».');
        const outputUnit = component.yieldUnit ?? 'قطعة';
        const quantity = convert(line.qty, line.unit ?? outputUnit, outputUnit, component.name);
        return sum + quantity * breakdown(component).total / component.yield;
      }, 0);
      const operation = recipe.operationMode === 'percent'
        ? ingredients * ((recipe.operation ?? 0) / 100)
        : recipe.operation ?? 0;
      const total = ingredients + operation;
      if (!Number.isFinite(total) || !Number.isFinite(total / recipe.yield)) {
        throw new Error('تعذّر حساب تكلفة «' + recipe.name + '». راجع الأسعار والكميات.');
      }
      const result = { ingredients, operation, total };
      costs.set(recipe.id, result);
      return result;
    } finally {
      visiting.delete(recipe.id);
    }
  }

  return breakdown;
}
