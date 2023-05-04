module.exports = {
  medal_id,
  protoDecode,
  protoEncode
}

function medal_id(id) {
  switch (id) {
    case 4873: return "2023 Service Medal (Lvl 1)";
    case 4874: return "2023 Service Medal (Lvl 2)";
    case 4875: return "2023 Service Medal (Lvl 3)";
    case 4876: return "2023 Service Medal (Lvl 4)";
    case 4877: return "2023 Service Medal (Lvl 5)";
    case 4878: return "2023 Service Medal (Lvl 6)";
    default: return `${id}`;
  }
}

function protoDecode(proto, obj) {
  return proto.toObject(proto.decode(obj), { defaults: true });
}

function protoEncode(proto, obj) {
  return proto.encode(proto.create(obj)).finish();
}
