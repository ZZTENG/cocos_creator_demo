/**
 * Created by ZZTENG on 2017/06/14.
 **/
const KeyValueManager = require('KeyValueManager');
const EventManager = require('EventManager');
const tag_error_code = 'tag_error_code';
//用于debug的error_code
let LogErrorCode = {"1001": "\u6743\u9650\u4e0d\u8db3", "1002": "\u672a\u5f00\u542f\u8be5\u529f\u80fd", "1003": "redis\u8bbf\u95ee\u5931\u8d25", "6001": "\u65e0\u6548\u7684auth_type", "6002": "\u65e0\u6548\u7684user_name", "6003": "\u5bc6\u7801\u9519\u8bef", "6004": "\u65e0\u6548\u7684refresh_token", "8001": "\u95ea\u7535\u73a9\u767b\u5f55\u5931\u8d25", "10001": "\u4e0d\u5b58\u5728\u8be5id\u73a9\u5bb6\u7684\u4fe1\u606f", "10002": "\u672a\u53d1\u9001user_id", "10003": "\u672a\u53d1\u9001session_key", "10004": "user_id\u6216session_key\u65e0\u6548", "10005": "\u672a\u77e5\u7684\u767b\u5f55\u9519\u8bef", "10006": "\u521b\u5efa\u89d2\u8272\u5931\u8d25", "10007": "\u521b\u5efa\u89d2\u8272\u5931\u8d25", "10008": "\u63d0\u4ea4\u53c2\u6570\u9519\u8bef", "10009": "channel\u53c2\u6570\u65e0\u6548", "11000": "\u7591\u4f3c\u4f5c\u5f0a", "10010": "\u4ed6\u4eba\u767b\u5f55", "11111": "csv\u6570\u636e\u4e0d\u4e00\u81f4", "11112": "\u53c2\u6570\u91cd\u590d", "20001": "\u9053\u5177\u6570\u91cf\u4e0d\u8db3", "20003": "\u8be5\u540d\u5b57\u5df2\u88ab\u5360\u7528", "20004": "\u540d\u5b57\u4fee\u6539\u524d\u540e\u76f8\u540c", "20005": "\u5305\u542b\u654f\u611f\u8bcd", "21001": "\u5546\u54c1\u8d2d\u4e70\u6570\u91cf\u5fc5\u987b\u5927\u4e8e1", "21002": "\u652f\u4ed8\u6e20\u9053\u9519\u8bef", "21003": "\u7f3a\u5c11\u5173\u5361ID,\u6216\u5546\u54c1ID\u65e0\u6548", "21004": "\u5df2\u5f00\u542f\u8fc7\u8be5\u5b9d\u7bb1", "21005": "\u672a\u8fbe\u6210\u6761\u4ef6", "21006": "\u5df2\u9886\u53d6\u8be5\u65e5\u8bb0\u5956\u52b1", "21007": "\u5df2\u9886\u53d6\u8be5\u6536\u85cf\u54c1\u5168\u90e8\u5956\u52b1", "21008": "\u4e0d\u5728\u4fc3\u9500\u65f6\u95f4\u6bb5\u5185", "21009": "\u8d85\u8fc7\u8d2d\u4e70\u6570\u91cf\u4e0a\u9650", "21010": "\u4e0d\u5b58\u5728\u8be5\u4e3b\u9898", "21012": "\u5df2\u9886\u53d6\u8fc7\u63a8\u8350\u76ae\u80a4", "21013": "\u4e0d\u80fd\u8d2d\u4e70\u5c0f\u4f53\u529b\u74f6", "21014": "\u5df2\u62e5\u6709\u8be5\u4f53\u529b\u74f6,", "21015": "\u8d2d\u4e70\u4f53\u529b\u74f6\u7684\u6570\u91cf\u4e0d\u80fd\u8d85\u8fc71", "21016": "vip\u7b49\u7ea7\u4e0d\u8db3,", "21017": "\u5f53\u65e510\u8fde\u6b21\u6570\u5df2\u7528\u5b8c", "30001": "\u4f53\u529b\u4e0d\u8db3", "30002": "\u9053\u5177,\u5206\u6570\u6216\u661f\u7ea7\u65e0\u6548", "30003": "\u4e0d\u5141\u8bb8\u4f7f\u7528\u8be5\u9053\u5177", "30004": "\u65e0\u6cd5\u6253\u5f00\u8be5\u5730\u56fe", "30005": "\u9053\u5177\u4f7f\u7528\u6570\u91cf\u8d85\u8fc7\u4e0a\u9650", "30006": "\u590d\u6d3b\u6b21\u6570\u4e0d\u8db3", "30007": "\u672a\u901a\u5173\u4efb\u4f55\u5173\u5361", "30008": "\u65e0\u6cd5\u5e2e\u52a9\u597d\u53cb\u89e3\u9501\u5173\u5361", "30009": "\u4e0d\u6ee1\u8db3\u89e3\u9501\u7ae0\u8282\u7684\u524d\u7f6e\u6761\u4ef6", "30010": "\u5df2\u8d85\u65f6,", "30011": "\u5206\u6570\u8fc7\u4f4e", "30012": "\u5206\u6570\u8fc7\u9ad8", "30013": "\u83b7\u5f97\u91d1\u5e01\u6570\u91cf\u4e0d\u7b26", "30014": "\u9f13\u52b1\u91d1\u5e01\u8fc7\u4f4e", "30015": "\u9f13\u52b1\u91d1\u5e01\u8fc7\u9ad8", "40001": "\u5df2\u62e5\u6709\u8be5\u88c5\u626e", "40002": "\u672a\u62e5\u6709\u8be5\u88c5\u626e", "40003": "\u5df2\u6ee1\u7ea7", "40005": "\u65e0\u6548\u7684id", "40006": "\u9644\u9b54\u4e2d\u6d88\u8017\u4e0e\u83b7\u5f97\u4e0d\u80fd\u76f8\u540c", "60001": "\u5237\u65b0\u6b21\u6570\u8d85\u8fc7\u4e0a\u9650", "60002": "\u65e0\u6cd5\u53d6\u5f97\u65b0\u7684\u4efb\u52a1", "60003": "\u5df2\u9886\u53d6\u8be5\u65e5\u5e38\u4efb\u52a1\u5956\u52b1", "60004": "\u5df2\u9886\u53d6\u8be5\u9636\u6bb5\u6d3b\u8dc3\u5ea6\u5b9d\u7bb1", "40004": "\u65e0\u6548\u7684type", "60005": "\u6bcf\u65e5\u4efb\u52a1\u6d3b\u8dc3\u5ea6\u4e0d\u8db3", "60006": "index\u8d85\u51fa\u8303\u56f4", "60007": "\u672a\u8fbe\u6210\u4efb\u52a1\u6761\u4ef6", "60008": "\u4e0d\u5b58\u5728\u8be5\u4efb\u52a1", "60009": "\u672a\u8fbe\u5230\u4efb\u52a1\u8981\u6c42\u5206\u6570", "60010": "\u672a\u53d6\u5f97\u4efb\u4f55\u4efb\u52a1", "70001": "\u672a\u627e\u5230\u8be5\u597d\u53cb\u7684\u6570\u636e", "70002": "\u4e0d\u80fd\u6dfb\u52a0\u81ea\u5df1\u4e3a\u597d\u53cb", "70003": "\u5df2\u662f\u597d\u53cb\u5173\u7cfb", "70016": "\u4e0d\u662f\u597d\u53cb\u5173\u7cfb", "72001": "\u8bb8\u613f\u5355\u6570\u76ee\u8d85\u8fc7\u4e0a\u9650", "72002": "\u8ddd\u79bb\u4e0a\u6b21\u53d1\u5e03\u65f6\u95f4\u8fc7\u8fd1", "72003": "\u65e0\u6548\u7684item_id", "72004": "\u5df2\u7ed9\u8fc7\u8be5\u9053\u5177", "73001": "\u4e0d\u662f\u597d\u53cb\u5173\u7cfb,\u65e0\u6cd5\u6267\u884c\u8be5\u64cd\u4f5c", "73002": "\u53cb\u597d\u5ea6\u4e0d\u8db3", "73003": "\u597d\u53cb\u4e0d\u80fd\u8fdb\u884c\u6b64\u5173\u5361\u6e38\u620f", "75001": "\u672a\u7ed9\u4e88\u4f53\u529b,\u65e0\u6cd5\u7d22\u8981", "75002": "\u65e0\u6cd5\u7d22\u8981", "75003": "\u9886\u53d6\u4f53\u529b\u6570\u91cf\u5df2\u7ecf\u8fbe\u5230\u4e0a\u9650", "76001": "\u597d\u53cb\u672a\u89e3\u9501\u8be5\u7ae0\u8282", "76002": "\u8be5\u597d\u53cb\u5df2\u5e2e\u52a9\u89e3\u9501\u8be5\u533a\u57df", "76003": "\u672a\u8fbe\u6210\u89e3\u9501\u8be5\u533a\u57df\u7684\u524d\u7f6e\u5173\u5361", "77001": "\u5f53\u524d\u72b6\u6001\u4e0d\u5141\u8bb8\u5339\u914d", "77002": "\u670d\u52a1\u5668\u7e41\u5fd9,", "77003": "\u6e38\u620f\u8fdb\u884c\u4e2d", "77004": "\u73a9\u5bb6\u4e0d\u5728\u6e38\u620f\u623f\u95f4\u5185", "77005": "\u6e38\u620f\u672a\u5f00\u59cb", "77006": "\u73a9\u5bb6pos\u548cid\u4e0d\u4e00\u81f4,", "77007": "\u672a\u5230\u7ed3\u7b97\u65f6\u95f4", "80001": "\u6c14\u7403\u5956\u52b1\u65e0\u6548", "80002": "\u672a\u53d1\u9001\u8fdb\u5165\u5c0f\u6e38\u620f\u534f\u8bae", "80003": "\u83b7\u5f97\u5956\u52b1\u6570\u91cf\u4e0d\u5339\u914d", "90001": "\u4e0d\u5b58\u5728\u8be5\u90ae\u4ef6", "90002": "\u8be5\u90ae\u4ef6\u4e0d\u5c5e\u4e8e\u597d\u53cb\u90ae\u4ef6", "90003": "\u8be5\u90ae\u4ef6\u4e0d\u5c5e\u4e8e\u7cfb\u7edf\u90ae\u4ef6", "90004": "\u8be5\u90ae\u4ef6\u4e0d\u5c5e\u4e8e\u65b0\u90ae\u4ef6", "90005": "\u8be5\u90ae\u4ef6\u4e0d\u5c5e\u4e8e\u7cfb\u7edf\u5956\u52b1\u90ae\u4ef6", "90006": "\u672a\u89e3\u9501\u8be5\u533a\u57df,\u65e0\u6cd5\u5e2e\u52a9\u597d\u53cb\u89e3\u9501", "91001": "\u8be5\u73a9\u5bb6\u5df2\u52a0\u5165\u53e6\u4e00\u961f\u4f0d", "91002": "\u672a\u52a0\u5165\u4efb\u4f55\u961f\u4f0d", "91003": "\u4e0d\u5b58\u5728\u6b64\u961f\u4f0d", "91004": "\u4e0d\u662f\u961f\u957f,\u6743\u9650\u4e0d\u8db3", "91005": "\u8be5\u73a9\u5bb6\u4e0d\u5c5e\u4e8e\u6b64\u961f\u4f0d", "91006": "\u8be5\u73a9\u5bb6\u672a\u7533\u8bf7\u52a0\u5165", "91007": "\u961f\u4f0d\u4eba\u6570\u8d85\u8fc7\u4e0a\u9650", "91008": "\u8be5\u73a9\u5bb6\u5df2\u7ecf\u5728\u961f\u4f0d\u5185", "91009": "\u4e0d\u5728\u9080\u8bf7\u5217\u8868\u5185", "91010": "\u5df2\u5b58\u5728\u8be5\u6218\u961f\u540d", "91011": "\u961f\u4f0d\u4eba\u6570\u4e0d\u8db3", "91012": "\u961f\u53cb\u672a\u4e0a\u7ebf", "91013": "\u9080\u8bf7\u5df2\u5931\u6548", "91019": "\u73a9\u5bb6\u4e0d\u5728\u7ebf,", "92001": "\u4e0d\u5b58\u5728\u8be5\u6e38\u620f\u623f\u95f4", "92002": "\u623f\u95f4\u5df2\u6ee1\u5458", "92003": "\u5df2\u9000\u51fa\u623f\u95f4", "92004": "\u672a\u5728\u623f\u95f4\u5185\u627e\u5230\u8be5\u73a9\u5bb6\u4fe1\u606f", "92005": "\u8be5\u961f\u4f0d\u4eba\u6570\u5df2\u8fbe\u5230\u4e0a\u9650", "92006": "\u4e0d\u5b58\u5728\u8be5\u961f\u4f0d", "92007": "\u8be5\u6a21\u5f0f\u4e0b\u4e0d\u5141\u8bb8\u6539\u53d8\u961f\u4f0d", "92008": "\u5df2\u5728\u67d0\u623f\u95f4\u5185,", "92009": "\u73a9\u5bb6\u4e0d\u5728\u8be5\u9635\u8425", "92010": "\u8be5\u623f\u95f4\u4e0d\u53ef\u8fdb\u5165", "92011": "\u8be5\u623f\u95f4\u6b63\u5728\u6e38\u620f\u4e2d", "92012": "\u9635\u8425\u4e0d\u7b26", "92013": "\u8be5\u623f\u95f4\u4e0d\u53ef\u89c2\u6218", "92014": "\u8be5\u623f\u95f4\u672a\u5f00\u59cb\u6e38\u620f","92015": '\u4e0d\u80fd\u5728\u4e00\u4e2a\u961f\u4f0d\u5185', "93001": "\u6b63\u5728\u6e38\u620f\u4e2d", "93002": "\u73a9\u5bb6\u672a\u5f00\u59cb\u5339\u914d\u6216\u5df2\u53d6\u6d88\u5339\u914d", "93003": "\u6b63\u5728\u5339\u914d\u4e2d", "93004": "\u73a9\u5bb6\u5df2\u7ecf\u6b7b\u4ea1", "93010": "\u672a\u53c2\u4e0e\u8be5\u573a\u6b21", "93011": "\u4e3b\u52a8\u9000\u51fa\u6e38\u620f\u623f\u95f4,", "93012": "\u961f\u53cb\u6b63\u5728\u5339\u914d\u4e2d", "93013": "\u5f53\u524d\u573a\u6b21\u5df2\u5f00\u8d5b,", "93014": "\u8be5\u573a\u6b21\u5df2\u7ed3\u675f.", "94001": "\u975e\u653b\u51fb\u6a21\u5f0f"};
//用于客户端的提示的
let ShowErrorCode = {"8001": "\u95ea\u7535\u73a9\u767b\u5f55\u5931\u8d25", "20001": "\u9053\u5177\u6570\u91cf\u4e0d\u8db3", "20003": "\u8be5\u540d\u5b57\u5df2\u88ab\u5360\u7528", "20004": "\u540d\u5b57\u4fee\u6539\u524d\u540e\u76f8\u540c", "20005": "\u5305\u542b\u654f\u611f\u8bcd", "21001": "\u5546\u54c1\u8d2d\u4e70\u6570\u91cf\u5fc5\u987b\u5927\u4e8e1", "21002": "\u652f\u4ed8\u6e20\u9053\u9519\u8bef", "21003": "\u7f3a\u5c11\u5173\u5361ID,\u6216\u5546\u54c1ID\u65e0\u6548", "21004": "\u5df2\u5f00\u542f\u8fc7\u8be5\u5b9d\u7bb1", "21005": "\u672a\u8fbe\u6210\u6761\u4ef6", "21006": "\u5df2\u9886\u53d6\u8be5\u65e5\u8bb0\u5956\u52b1", "21007": "\u5df2\u9886\u53d6\u8be5\u6536\u85cf\u54c1\u5168\u90e8\u5956\u52b1", "21008": "\u4e0d\u5728\u4fc3\u9500\u65f6\u95f4\u6bb5\u5185", "21009": "\u8d85\u8fc7\u8d2d\u4e70\u6570\u91cf\u4e0a\u9650", "21010": "\u4e0d\u5b58\u5728\u8be5\u4e3b\u9898", "21012": "\u5df2\u9886\u53d6\u8fc7\u63a8\u8350\u76ae\u80a4", "21013": "\u4e0d\u80fd\u8d2d\u4e70\u5c0f\u4f53\u529b\u74f6", "21014": "\u5df2\u62e5\u6709\u8be5\u4f53\u529b\u74f6,", "21015": "\u8d2d\u4e70\u4f53\u529b\u74f6\u7684\u6570\u91cf\u4e0d\u80fd\u8d85\u8fc71", "21016": "vip\u7b49\u7ea7\u4e0d\u8db3,", "21017": "\u5f53\u65e510\u8fde\u6b21\u6570\u5df2\u7528\u5b8c", "30001": "\u4f53\u529b\u4e0d\u8db3", "30002": "\u9053\u5177,\u5206\u6570\u6216\u661f\u7ea7\u65e0\u6548", "30003": "\u4e0d\u5141\u8bb8\u4f7f\u7528\u8be5\u9053\u5177", "30004": "\u65e0\u6cd5\u6253\u5f00\u8be5\u5730\u56fe", "30005": "\u9053\u5177\u4f7f\u7528\u6570\u91cf\u8d85\u8fc7\u4e0a\u9650", "30006": "\u590d\u6d3b\u6b21\u6570\u4e0d\u8db3", "30007": "\u672a\u901a\u5173\u4efb\u4f55\u5173\u5361", "30008": "\u65e0\u6cd5\u5e2e\u52a9\u597d\u53cb\u89e3\u9501\u5173\u5361", "30009": "\u4e0d\u6ee1\u8db3\u89e3\u9501\u7ae0\u8282\u7684\u524d\u7f6e\u6761\u4ef6", "30010": "\u5df2\u8d85\u65f6,", "30011": "\u5206\u6570\u8fc7\u4f4e", "30012": "\u5206\u6570\u8fc7\u9ad8", "30013": "\u83b7\u5f97\u91d1\u5e01\u6570\u91cf\u4e0d\u7b26", "30014": "\u9f13\u52b1\u91d1\u5e01\u8fc7\u4f4e", "30015": "\u9f13\u52b1\u91d1\u5e01\u8fc7\u9ad8", "40001": "\u5df2\u62e5\u6709\u8be5\u88c5\u626e", "40002": "\u672a\u62e5\u6709\u8be5\u88c5\u626e", "40003": "\u5df2\u6ee1\u7ea7", "40005": "\u65e0\u6548\u7684id", "40006": "\u9644\u9b54\u4e2d\u6d88\u8017\u4e0e\u83b7\u5f97\u4e0d\u80fd\u76f8\u540c", "60001": "\u5237\u65b0\u6b21\u6570\u8d85\u8fc7\u4e0a\u9650", "60002": "\u65e0\u6cd5\u53d6\u5f97\u65b0\u7684\u4efb\u52a1", "60003": "\u5df2\u9886\u53d6\u8be5\u65e5\u5e38\u4efb\u52a1\u5956\u52b1", "60004": "\u5df2\u9886\u53d6\u8be5\u9636\u6bb5\u6d3b\u8dc3\u5ea6\u5b9d\u7bb1", "40004": "\u65e0\u6548\u7684type", "60005": "\u6bcf\u65e5\u4efb\u52a1\u6d3b\u8dc3\u5ea6\u4e0d\u8db3", "60006": "index\u8d85\u51fa\u8303\u56f4", "60007": "\u672a\u8fbe\u6210\u4efb\u52a1\u6761\u4ef6", "60008": "\u4e0d\u5b58\u5728\u8be5\u4efb\u52a1", "60009": "\u672a\u8fbe\u5230\u4efb\u52a1\u8981\u6c42\u5206\u6570", "60010": "\u672a\u53d6\u5f97\u4efb\u4f55\u4efb\u52a1", "70001": "\u672a\u627e\u5230\u8be5\u597d\u53cb\u7684\u6570\u636e", "70002": "\u4e0d\u80fd\u6dfb\u52a0\u81ea\u5df1\u4e3a\u597d\u53cb", "70003": "\u5df2\u662f\u597d\u53cb\u5173\u7cfb", "70016": "\u4e0d\u662f\u597d\u53cb\u5173\u7cfb", "72001": "\u8bb8\u613f\u5355\u6570\u76ee\u8d85\u8fc7\u4e0a\u9650", "72002": "\u8ddd\u79bb\u4e0a\u6b21\u53d1\u5e03\u65f6\u95f4\u8fc7\u8fd1", "72003": "\u65e0\u6548\u7684item_id", "72004": "\u5df2\u7ed9\u8fc7\u8be5\u9053\u5177", "73001": "\u4e0d\u662f\u597d\u53cb\u5173\u7cfb,\u65e0\u6cd5\u6267\u884c\u8be5\u64cd\u4f5c", "73002": "\u53cb\u597d\u5ea6\u4e0d\u8db3", "73003": "\u597d\u53cb\u4e0d\u80fd\u8fdb\u884c\u6b64\u5173\u5361\u6e38\u620f", "75001": "\u672a\u7ed9\u4e88\u4f53\u529b,\u65e0\u6cd5\u7d22\u8981", "75002": "\u65e0\u6cd5\u7d22\u8981", "75003": "\u9886\u53d6\u4f53\u529b\u6570\u91cf\u5df2\u7ecf\u8fbe\u5230\u4e0a\u9650", "76001": "\u597d\u53cb\u672a\u89e3\u9501\u8be5\u7ae0\u8282", "76002": "\u8be5\u597d\u53cb\u5df2\u5e2e\u52a9\u89e3\u9501\u8be5\u533a\u57df", "76003": "\u672a\u8fbe\u6210\u89e3\u9501\u8be5\u533a\u57df\u7684\u524d\u7f6e\u5173\u5361", "77001": "\u5f53\u524d\u72b6\u6001\u4e0d\u5141\u8bb8\u5339\u914d", "77002": "\u670d\u52a1\u5668\u7e41\u5fd9,", "77003": "\u6e38\u620f\u8fdb\u884c\u4e2d", "77004": "\u73a9\u5bb6\u4e0d\u5728\u6e38\u620f\u623f\u95f4\u5185", "77005": "\u6e38\u620f\u672a\u5f00\u59cb", "77006": "\u73a9\u5bb6pos\u548cid\u4e0d\u4e00\u81f4,", "77007": "\u672a\u5230\u7ed3\u7b97\u65f6\u95f4", "80001": "\u6c14\u7403\u5956\u52b1\u65e0\u6548", "80002": "\u672a\u53d1\u9001\u8fdb\u5165\u5c0f\u6e38\u620f\u534f\u8bae", "80003": "\u83b7\u5f97\u5956\u52b1\u6570\u91cf\u4e0d\u5339\u914d", "90001": "\u4e0d\u5b58\u5728\u8be5\u90ae\u4ef6", "90002": "\u8be5\u90ae\u4ef6\u4e0d\u5c5e\u4e8e\u597d\u53cb\u90ae\u4ef6", "90003": "\u8be5\u90ae\u4ef6\u4e0d\u5c5e\u4e8e\u7cfb\u7edf\u90ae\u4ef6", "90004": "\u8be5\u90ae\u4ef6\u4e0d\u5c5e\u4e8e\u65b0\u90ae\u4ef6", "90005": "\u8be5\u90ae\u4ef6\u4e0d\u5c5e\u4e8e\u7cfb\u7edf\u5956\u52b1\u90ae\u4ef6", "90006": "\u672a\u89e3\u9501\u8be5\u533a\u57df,\u65e0\u6cd5\u5e2e\u52a9\u597d\u53cb\u89e3\u9501", "91001": "\u8be5\u73a9\u5bb6\u5df2\u52a0\u5165\u53e6\u4e00\u961f\u4f0d", "91002": "\u672a\u52a0\u5165\u4efb\u4f55\u961f\u4f0d", "91003": "\u4e0d\u5b58\u5728\u6b64\u961f\u4f0d", "91004": "\u4e0d\u662f\u961f\u957f,\u6743\u9650\u4e0d\u8db3", "91005": "\u8be5\u73a9\u5bb6\u4e0d\u5c5e\u4e8e\u6b64\u961f\u4f0d", "91006": "\u8be5\u73a9\u5bb6\u672a\u7533\u8bf7\u52a0\u5165", "91007": "\u961f\u4f0d\u4eba\u6570\u8d85\u8fc7\u4e0a\u9650", "91008": "\u8be5\u73a9\u5bb6\u5df2\u7ecf\u5728\u961f\u4f0d\u5185", "91009": "\u4e0d\u5728\u9080\u8bf7\u5217\u8868\u5185", "91010": "\u5df2\u5b58\u5728\u8be5\u6218\u961f\u540d", "91011": "\u961f\u4f0d\u4eba\u6570\u4e0d\u8db3", "91012": "\u961f\u53cb\u672a\u4e0a\u7ebf", "91013": "\u9080\u8bf7\u5df2\u5931\u6548", "91019": "\u73a9\u5bb6\u4e0d\u5728\u7ebf,","91021": '\u8d26\u53f7\u4e0d\u6b63\u786e', "92001": "\u4e0d\u5b58\u5728\u8be5\u6e38\u620f\u623f\u95f4", "92002": "\u623f\u95f4\u5df2\u6ee1\u5458", "92003": "\u5df2\u9000\u51fa\u623f\u95f4", "92004": "\u672a\u5728\u623f\u95f4\u5185\u627e\u5230\u8be5\u73a9\u5bb6\u4fe1\u606f", "92005": "\u8be5\u961f\u4f0d\u4eba\u6570\u5df2\u8fbe\u5230\u4e0a\u9650", "92006": "\u4e0d\u5b58\u5728\u8be5\u961f\u4f0d", "92007": "\u8be5\u6a21\u5f0f\u4e0b\u4e0d\u5141\u8bb8\u6539\u53d8\u961f\u4f0d", "92008": "\u5df2\u5728\u67d0\u623f\u95f4\u5185,", "92009": "\u73a9\u5bb6\u4e0d\u5728\u8be5\u9635\u8425", "92010": "\u8be5\u623f\u95f4\u4e0d\u53ef\u8fdb\u5165", "92011": "\u8be5\u623f\u95f4\u6b63\u5728\u6e38\u620f\u4e2d", "92012": "\u9635\u8425\u4e0d\u7b26", "92013": "\u8be5\u623f\u95f4\u4e0d\u53ef\u89c2\u6218", "92014": "\u8be5\u623f\u95f4\u672a\u5f00\u59cb\u6e38\u620f", "93001": "\u6b63\u5728\u6e38\u620f\u4e2d", "93002": "\u73a9\u5bb6\u672a\u5f00\u59cb\u5339\u914d\u6216\u5df2\u53d6\u6d88\u5339\u914d", "92015": '\u4e0d\u80fd\u5728\u4e00\u4e2a\u961f\u4f0d\u5185',"93003": "\u6b63\u5728\u5339\u914d\u4e2d", "93004": "\u73a9\u5bb6\u5df2\u7ecf\u6b7b\u4ea1", "93010": "\u672a\u53c2\u4e0e\u8be5\u573a\u6b21", "93011": "\u4e3b\u52a8\u9000\u51fa\u6e38\u620f\u623f\u95f4,", "93012": "\u961f\u53cb\u6b63\u5728\u5339\u914d\u4e2d", "93013": "\u5f53\u524d\u573a\u6b21\u5df2\u5f00\u8d5b,", "93014": "\u8be5\u573a\u6b21\u5df2\u7ed3\u675f.", "94001": "\u975e\u653b\u51fb\u6a21\u5f0f"};
//用于逻辑处理
let LogicErrorCode = {}
let ErroCodeManager = {
    handle_error_code: function (error) {
        //log(debug)
        if(LogErrorCode[error]){
            cc.log(tag_error_code,error,LogErrorCode[error]);
        }
        //tips(UI)
        if(ShowErrorCode[error]){
            KeyValueManager['msg_text'] = ShowErrorCode[error];
            EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
        }
        //UI handle
        // switch (error_code){
        //     case 6002: {
        //         KeyValueManager['msg_text'] ='无效的用户';
        //         EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
        //     }
        //     break;
        //     case 6003: {
        //         KeyValueManager['msg_text'] ='密码错误';
        //         EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
        //     }
        //     break;
        //     case 6004: {
        //         cc.log(tag_error_code,error_code,'无效的refresh_token');
        //     }
        //     break;
        //     case 8001: {
        //         KeyValueManager['msg_text'] ='密码错误';
        //         EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
        //     }
        //     break;
        //     case 10001: {
        //         cc.log(tag_error_code,error_code,'不存在该id玩家的信息');
        //     }
        //     break;
        //     case 10002: {
        //         cc.log(tag_error_code,error_code,'未发送user_id');
        //     }
        //     break;
        //     case 10003: {
        //         cc.log(tag_error_code,error_code,'未发送session_key');;
        //     }
        //     break;
        //     case 10004: {
        //         cc.log(tag_error_code,error_code,'user_id或session_key无效');
        //     }
        //     break;
        //     case 10005: {
        //         cc.log(tag_error_code,error_code,'未知的登录错误');
        //     }
        //         break;
        //     case 10006: {
        //         cc.log(tag_error_code,error_code,'创建角色失败');
        //     }
        //         break;
        //     case 10007: {
        //         cc.log(tag_error_code,error_code,'创建角色失败');
        //     }
        //         break;
        //     case 10008: {
        //         cc.log(tag_error_code,error_code,'提交参数错误');
        //     }
        //         break;
        //     case 10009: {
        //         cc.log(tag_error_code,error_code,'channel参数无效');
        //     }
        //         break;
        //     case 11000: {
        //         cc.log(tag_error_code,error_code,'疑似作弊');
        //     }
        //         break;
        //     case 10010: {
        //         cc.log(tag_error_code,error_code,'他人登录');      //做异常登录处理
        //     }
        //         break;
        //     case 11111: {
        //         cc.log(tag_error_code,error_code,'csv数据不一致');
        //     }
        //         break;
        //     case 11112: {
        //         cc.log(tag_error_code,error_code,'参数重复');
        //     }
        //     break;
        //     case 20001: {
        //         KeyValueManager['msg_text'] ='道具数量不足';
        //         EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
        //     }
        //     break;
        //     case 20003: {
        //         KeyValueManager['msg_text'] ='该名字已被占用';
        //         EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
        //     }
        //         break;
        //     case 20004: {
        //         KeyValueManager['msg_text'] ='名字修改前后相同';
        //         EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
        //     }
        //         break;
        //     case 20005: {
        //         KeyValueManager['msg_text'] ='包含敏感词';
        //         EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
        //     }
        //         break;
        //     case 21001: {
        //         KeyValueManager['msg_text'] ='商品购买数量必须大于1';
        //         EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
        //     }
        //         break;
        //     case 21001: {
        //         KeyValueManager['msg_text'] ='商品购买数量必须大于1';
        //         EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
        //     }
        //         break;
        //     case 21002: {
        //         cc.log(tag_error_code,error_code,'支付渠道错误');
        //     }
        //         break;
        //     case 21003: {
        //         cc.log(tag_error_code,error_code,'缺少关卡ID,或商品ID无效');
        //     }
        //         break;
        //     case 21004: {
        //         KeyValueManager['msg_text'] ='已开启过该宝箱';
        //         EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
        //     }
        //         break;
        //     case 21005: {
        //         KeyValueManager['msg_text'] ='未达成条件';
        //         EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
        //     }
        //         break;
        //     case 21006: {
        //         KeyValueManager['msg_text'] ='已领取该日记奖励';
        //         EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
        //     }
        //         break;
        //     case 21007: {
        //         KeyValueManager['msg_text'] ='已领取该收藏品全部奖励';
        //         EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
        //     }
        //         break;
        //     case 21008: {
        //         KeyValueManager['msg_text'] ='不在促销时间段内';
        //         EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
        //     }
        //         break;
        //     case 21009: {
        //         KeyValueManager['msg_text'] ='超过购买数量上限';
        //         EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
        //     }
        //         break;
        //     case 21010: {
        //         KeyValueManager['msg_text'] ='不存在该主题';
        //         EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
        //     }
        //         break;
        //     case 21012: {
        //         KeyValueManager['msg_text'] ='已领取过推荐皮肤';
        //         EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
        //     }
        //         break;
        //     case 21013: {
        //         KeyValueManager['msg_text'] ='不能购买小体力瓶';
        //         EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
        //     }
        //         break;
        //     case 21014: {
        //         KeyValueManager['msg_text'] ='已拥有该体力瓶, 不能购买';
        //         EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
        //     }
        //         break;
        //     case 21015: {
        //         KeyValueManager['msg_text'] ='购买体力瓶的数量不能超过1';
        //         EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
        //     }
        //         break;
        //     case 21016: {
        //         KeyValueManager['msg_text'] ='vip等级不足, 不能购买金币';
        //         EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
        //     }
        //         break;
        //     case 21017: {
        //         KeyValueManager['msg_text'] ='当日10连次数已用完';
        //         EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
        //     }
        //         break;
        //     case 30001: {
        //         KeyValueManager['msg_text'] ='体力不足';
        //         EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
        //     }
        //         break;
        //     case 30002: {
        //         cc.log(tag_error_code,error_code,'道具,分数或星级无效');
        //     }
        //         break;
        //     case 30003: {
        //         KeyValueManager['msg_text'] ='不允许使用该道具';
        //         EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
        //     }
        //         break;
        //     case 30004: {
        //         KeyValueManager['msg_text'] ='无法打开该地图';
        //         EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
        //     }
        //         break;
        //     case 30005: {
        //         KeyValueManager['msg_text'] ='道具使用数量超过上限';
        //         EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
        //     }
        //         break;
        //     case 30006: {
        //         KeyValueManager['msg_text'] ='复活次数不足';
        //         EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
        //     }
        //         break;
        //     case 30007: {
        //         KeyValueManager['msg_text'] ='未通关任何关卡';
        //         EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
        //     }
        //         break;
        //     case 30008: {
        //         KeyValueManager['msg_text'] ='无法帮助好友解锁关卡';
        //         EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
        //     }
        //         break;
        //     case 30009: {
        //         KeyValueManager['msg_text'] ='不满足解锁章节的前置条件';
        //         EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
        //     }
        //         break;
        //     case 30010: {
        //         KeyValueManager['msg_text'] ='已超时, 请重新进入关卡';
        //         EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
        //     }
        //         break;
        //     case 30011: {
        //         KeyValueManager['msg_text'] ='分数过低';
        //         EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
        //     }
        //         break;
        //     case 30012: {
        //         KeyValueManager['msg_text'] ='分数过高';
        //         EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
        //     }
        //         break;
        //     case 30013: {
        //         cc.log(tag_error_code,error_code,'获得金币数量不符');
        //     }
        //         break;
        //     case 30014: {
        //         KeyValueManager['msg_text'] ='鼓励金币过低';
        //         EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
        //     }
        //         break;
        //     case 30014: {
        //         KeyValueManager['msg_text'] ='鼓励金币过高';
        //         EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
        //     }
        //         break;
        //     case 40001: {
        //         KeyValueManager['msg_text'] ='已拥有该装扮';
        //         EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
        //     }
        //         break;
        //     case 40002: {
        //         KeyValueManager['msg_text'] ='未拥有该装扮';
        //         EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
        //     }
        //         break;
        //     case 40003: {
        //         KeyValueManager['msg_text'] ='已满级';
        //         EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
        //     }
        //         break;
        //     case 40004: {
        //         cc.log(tag_error_code,error_code,'无效的type');
        //     }
        //         break;
        //     case 40005: {
        //         cc.log(tag_error_code,error_code,'无效的id');
        //     }
        //         break;
        //     case 40006: {
        //         cc.log(tag_error_code,error_code,'附魔中消耗与获得不能相同');
        //     }
        //         break;
        //     case 60001: {
        //         KeyValueManager['msg_text'] ='刷新次数超过上限';
        //         EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
        //     }
        //         break;
        //     case 60002: {
        //         KeyValueManager['msg_text'] ='无法取得新的任务';
        //         EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
        //     }
        //         break;
        //     case 60003: {
        //         KeyValueManager['msg_text'] ='已领取该日常任务奖励';
        //         EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
        //     }
        //         break;
        //     case 60004: {
        //         KeyValueManager['msg_text'] ='已领取该阶段活跃度宝箱';
        //         EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
        //     }
        //         break;
        //     case 60005: {
        //         KeyValueManager['msg_text'] ='每日任务活跃度不足';
        //         EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
        //     }
        //         break;
        //     case 60006: {
        //         cc.log(tag_error_code,error_code,'index超出范围');
        //     }
        //         break;
        //     case 60007: {
        //         cc.log(tag_error_code,error_code,'未达成任务条件');
        //     }
        //         break;
        //     case 60008: {
        //         cc.log(tag_error_code,error_code,'不存在该任务');
        //     }
        //         break;
        //     case 60009: {
        //         KeyValueManager['msg_text'] ='未达到任务要求分数';
        //         EventManager.pushEvent({'msg_id': 'OPEN_LAYER', 'layer_id': 'msg_layer', 'hide_preLayer':false});
        //     }
        //         break;
        // }
    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
}
module.exports = ErroCodeManager;